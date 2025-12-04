import "dotenv/config";
import { readFileSync } from "fs";
import { openai } from "@ai-sdk/openai";
import {
  streamText,
  convertToModelMessages,
  tool,
  stepCountIs,
  type UIMessage,
  createUIMessageStream,
  createUIMessageStreamResponse,
} from "ai";
import { z } from "zod";
import { cursos, type Curso } from "./cursos";
import { findSimilarChunks } from "./embeddings";

const model = openai("gpt-4.1-mini");

const baseSystem = readFileSync("system.txt", "utf-8");

export const chat = (messages: UIMessage[], sessionId?: string) => {
  return streamText({
    model,
    system: baseSystem,
    messages: convertToModelMessages(messages),
    tools: {
      // Tool para buscar en documentos subidos (RAG)
      searchContext: tool({
        description:
          "Busca información relevante en los documentos que el usuario ha subido. Usa esta tool cuando necesites encontrar información específica.",
        inputSchema: z.object({
          query: z.string().describe("La pregunta o tema a buscar"),
        }),
        execute: async ({ query }) => {
          if (!sessionId) {
            return { found: false, message: "No hay documentos cargados" };
          }
          const results = await findSimilarChunks(sessionId, query, 3);
          if (results.length === 0) {
            return {
              found: false,
              message: "No encontré información relevante",
            };
          }
          return {
            found: true,
            results: results.map((r) => ({
              content: r.chunk.content,
              similarity: Math.round(r.similarity * 100),
            })),
          };
        },
      }),

      // Tool para mostrar cursos visualmente
      showCourse: tool({
        description:
          "Muestra una tarjeta visual de un curso de Fixtergeek. Usa esta tool para presentar cursos de forma atractiva.",
        inputSchema: z.object({
          courseId: z
            .string()
            .describe(
              "ID del curso: ai-sdk, gemini-cli, claude-code, react-router, motion, chatgpt-node"
            ),
        }),
        execute: async ({ courseId }): Promise<Curso> => {
          console.log(`\n🔧 showCourse ejecutado con courseId: "${courseId}"`);
          const curso = cursos.find((c) => c.id === courseId);
          console.log(
            `   → Curso encontrado: ${
              curso?.titulo || "NINGUNO, usando default"
            }`
          );
          return curso || cursos[0];
        },
      }),
    },
    prepareStep: ({ stepNumber }) => {
      console.log(`\n=== PREPARE STEP ${stepNumber} ===`);
      if (stepNumber === 0) {
        // Workaround para bug #8992: toolChoice "required" no se aplica
        // Usar toolChoice con tool específico en lugar de "required"
        console.log("→ toolChoice: auto (dejamos que el modelo decida)");
        return { toolChoice: "auto" };
      }
      console.log("→ toolChoice: none");
      return { toolChoice: "none" };
    },
    onStepFinish: ({ stepType, toolCalls, toolResults, text }) => {
      console.log(`\n=== STEP FINISHED ===`);
      console.log("stepType:", stepType);
      console.log("toolCalls:", toolCalls?.length || 0);
      console.log("toolResults:", toolResults?.length || 0);
      console.log("text:", text?.slice(0, 100) || "(no text)");
      if (toolCalls?.length) {
        toolCalls.forEach((tc) => {
          console.log(`  → Tool: ${tc.toolName}(${JSON.stringify(tc.args)})`);
        });
      }
    },
    stopWhen: stepCountIs(2),
  });
};

export const chat_with_artifact = (data: {
  messages: UIMessage[];
  sessionId?: string;
}) => {
  const { messages } = data;
  const lastMessage = messages[messages.length - 1];
  const userPrompt =
    lastMessage?.parts
      ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join(" ") || "Genera un componente React";

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      writer.write({ type: "start" });

      // 1. Generar código y acumularlo mientras se streamea al artifact
      let fullCode = "";
      const codeResult = streamText({
        model,
        system:
          "Genera solo código React/TypeScript limpio, dentro de un bloque de código markdown.",
        prompt: userPrompt,
      });

      for await (const chunk of codeResult.textStream) {
        fullCode += chunk;
        writer.write({
          type: "data-custom",
          data: { custom: chunk },
        });
      }

      // 2. CLAVE: Ahora el chat SABE qué código se generó (artifact-aware)
      const chatResult = streamText({
        model,
        system: `Eres un experto React asistente. El usuario pidió generar código y ya se generó.

        CÓDIGO GENERADO:
        \`\`\`tsx
        ${fullCode}
        \`\`\`

        Explica brevemente qué hace el código. Puedes:
        - Referenciar partes específicas del código (solo si es necesario y en snipets muy pequeños)
        - Sugerir mejoras si las hay
        - Responder preguntas sobre el código

        Sé conciso, el usuario ya ve el código en el panel. 
        Importante: Ya no deberías generes más código, solo explicalo.`,
        prompt: userPrompt,
      });

      writer.merge(chatResult.toUIMessageStream());
    },
  });
  return createUIMessageStreamResponse({ stream });
};
