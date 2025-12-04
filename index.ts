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
      .join(" ") || "Inventa un componente artifact en código react con ts";

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      writer.write({ type: "start" });
      const defaultResult = streamText({
        model,
        system:
          "Eres un programador React asistente experto en artefactos y ui generativa con LLMs y el Vercel AI-SDK. Importante: sé breve y no devuelvas código.",
        prompt: userPrompt,
      });
      const codeResult = streamText({
        model,
        prompt: `
        Genera el código de un componente Artifact en React.
        Importante: devuelve solo el código sin notas ni comentarios.
        `,
      });
      for await (const part of codeResult.textStream) {
        writer.write({
          type: "data-custom",
          data: {
            custom: part,
          },
        });
      }
      writer.merge(defaultResult.toUIMessageStream());
    },
  });
  return createUIMessageStreamResponse({ stream });
};
