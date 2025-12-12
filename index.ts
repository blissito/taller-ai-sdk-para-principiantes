import "dotenv/config";
import { createOpenAI } from "@ai-sdk/openai";
import { ModelMessage, streamText, tool, stepCountIs } from "ai";
import { z } from "zod";
import { getConfig, getEnabledTools } from "./db/index.js";

const system = `Eres un robot inteligente que asiste con lo que le piden sin romper las 3 leyes de la robótica de isaac asimov.

IMPORTANTE: Cuando generes código, SIEMPRE usa la herramienta showArtifact para mostrarlo en el panel de artefactos.
- Usa showArtifact para mostrar código, ejemplos, snippets, etc.
- El usuario verá el código en un panel dedicado a la derecha
- Después de llamar showArtifact, explica brevemente qué hace el código`;

// Función para obtener la API key (DB tiene prioridad sobre env)
export function getOpenAIApiKey(): string | undefined {
  const dbKey = getConfig("openai_api_key");
  return dbKey || process.env.OPENAI_API_KEY;
}

// Función para obtener el modelo configurado
export function getModelId(): string {
  const dbModel = getConfig("model");
  return dbModel || "gpt-4o-mini";
}

// Convierte JSON Schema a Zod (simplificado)
function jsonSchemaToZod(schema: any): z.ZodTypeAny {
  if (!schema || typeof schema !== "object") return z.any();
  if (schema.type === "string") return z.string().describe(schema.description || "");
  if (schema.type === "number" || schema.type === "integer") return z.number().describe(schema.description || "");
  if (schema.type === "boolean") return z.boolean().describe(schema.description || "");
  if (schema.type === "array") return z.array(jsonSchemaToZod(schema.items || {}));
  if (schema.type === "object" && schema.properties) {
    const shape: Record<string, z.ZodTypeAny> = {};
    for (const [key, val] of Object.entries(schema.properties)) {
      shape[key] = jsonSchemaToZod(val);
    }
    return z.object(shape);
  }
  return z.any();
}

// Construye tools dinámicas desde la DB
function buildDynamicTools(): Record<string, any> {
  const dbTools = getEnabledTools();
  const result: Record<string, any> = {};

  for (const t of dbTools) {
    const inputSchema = JSON.parse(t.inputSchemaJson);
    const headers = t.headersJson ? JSON.parse(t.headersJson) : {};

    result[t.name] = tool({
      description: t.description,
      inputSchema: jsonSchemaToZod(inputSchema) as z.ZodObject<any>,
      execute: async (params: Record<string, unknown>) => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), t.timeoutMs || 10000);
        try {
          const res = await fetch(t.endpointUrl, {
            method: t.httpMethod || "POST",
            headers: { "Content-Type": "application/json", ...headers },
            body: JSON.stringify(params),
            signal: controller.signal,
          });
          clearTimeout(timeout);
          return await res.json();
        } catch (e: any) {
          clearTimeout(timeout);
          return { error: e.message || "Error ejecutando tool" };
        }
      },
    });
  }
  return result;
}

export const chat = (messages: ModelMessage[]) => {
  const apiKey = getOpenAIApiKey();

  if (!apiKey) {
    throw new Error("No se ha configurado la API key de OpenAI");
  }

  const openai = createOpenAI({ apiKey });
  const modelId = getModelId();
  const model = openai(modelId);

  // Tool fija + tools dinámicas de la DB
  const tools = {
    showArtifact: tool({
      description:
        "Muestra código o contenido en el panel de artefactos. Usa esta herramienta para mostrar código, ejemplos, snippets de forma visual.",
      inputSchema: z.object({
        type: z
          .enum(["code", "markdown", "error"])
          .describe("Tipo de artefacto: code para código, markdown para texto formateado, error para errores"),
        title: z.string().describe("Título descriptivo del artefacto"),
        content: z.string().describe("El código o contenido a mostrar"),
        language: z
          .string()
          .describe("Lenguaje de programación: javascript, typescript, python, html, css, text"),
      }),
      execute: async ({ type, title, content, language }) => {
        return { type, title, content, language, shown: true };
      },
    }),
    ...buildDynamicTools(),
  };

  return streamText({
    model,
    system,
    messages,
    tools,
    stopWhen: stepCountIs(5),
  });
};
