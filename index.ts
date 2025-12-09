import "dotenv/config";
import { createOpenAI } from "@ai-sdk/openai";
import { ModelMessage, streamText, tool } from "ai";
import { z } from "zod";
import { getConfig } from "./db/index.js";

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

export const chat = (messages: ModelMessage[]) => {
  const apiKey = getOpenAIApiKey();

  if (!apiKey) {
    throw new Error("No se ha configurado la API key de OpenAI");
  }

  const openai = createOpenAI({ apiKey });
  const modelId = getModelId();
  const model = openai(modelId);

  return streamText({
    model,
    system,
    messages,
    tools: {
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
          // El resultado se enviará como tool-result y el frontend lo detectará
          return { type, title, content, language, shown: true };
        },
      }),
    },
    maxSteps: 2, // Permitir que el modelo responda después de usar la tool
  });
};
