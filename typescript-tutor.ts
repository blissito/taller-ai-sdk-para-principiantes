import {
  ToolLoopAgent,
  tool,
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
  convertToModelMessages,
  stepCountIs,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

const model = openai("gpt-4o-mini");

/**
 * TypeScript Tutor Agent
 *
 * Un agente que enseña TypeScript generando ejemplos de código ejecutables.
 * Usa ToolLoopAgent del AI SDK 6 para manejar el loop de herramientas.
 */
export const tutorAgent = new ToolLoopAgent({
  model,
  instructions: `Eres un tutor de TypeScript amigable para principiantes.

REGLAS:
1. Cuando el usuario pregunte sobre un tema de TypeScript, SIEMPRE usa la herramienta generateCode para crear un ejemplo práctico PRIMERO.
2. Después de generar el código, explica brevemente qué hace.
3. IMPORTANTE: NUNCA repitas el código en tu explicación. El código ya se muestra automáticamente en el panel izquierdo (Sandpack). Solo explica los conceptos.
4. Mantén las explicaciones simples y concisas (2-4 oraciones máximo).

TEMAS QUE DOMINAS:
- Types básicos (string, number, boolean, arrays)
- Functions y arrow functions
- Interfaces y Types
- Objects y destructuring
- Generics básicos

ESTILO DEL CÓDIGO:
- Usa nombres de variables en español para los ejemplos
- Agrega comentarios explicativos en el código
- Mantén los ejemplos cortos pero completos
- Incluye console.log para mostrar resultados

ESTILO DE LA EXPLICACIÓN:
- NO uses bloques de código markdown en tu respuesta
- Solo texto explicativo, el código ya está visible
- Sé breve y directo`,

  tools: {
    generateCode: tool({
      description:
        "Genera un ejemplo de código TypeScript ejecutable para enseñar un concepto. SIEMPRE usa esta herramienta cuando el usuario pregunte sobre TypeScript.",
      inputSchema: z.object({
        topic: z
          .string()
          .describe(
            "El tema del código: types, functions, interfaces, arrays, objects, generics"
          ),
        title: z.string().describe("Título corto del ejemplo"),
        code: z
          .string()
          .describe(
            "Código TypeScript completo y ejecutable. Incluye console.log para mostrar resultados."
          ),
      }),
      execute: async ({ topic, title, code }) => {
        console.log(`\n🎓 Generando código para: ${topic}`);
        console.log(`   Título: ${title}`);
        return { topic, title, code, success: true };
      },
    }),
  },

  stopWhen: stepCountIs(5),
});

/**
 * Función principal del tutor con streaming dual
 *
 * Usa el patrón moderno con onChunk callback para capturar tool results
 * mientras el stream fluye hacia el cliente.
 */
export const tutor = (messages: UIMessage[]) => {
  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      const modelMessages = await convertToModelMessages(messages);

      // El agente procesa con callback para capturar chunks
      const result = await tutorAgent.stream({
        messages: modelMessages,
        onChunk({ chunk }) {
          // Capturar tool results y enviar al artifact
          if (chunk.type === "tool-result" && chunk.toolName === "generateCode") {
            const output = chunk.output as {
              topic: string;
              title: string;
              code: string;
            };

            writer.write({
              type: "data-custom",
              data: {
                type: "code",
                topic: output.topic,
                title: output.title,
                code: output.code,
              },
            });

            console.log(`✅ Código enviado al artifact`);
          }
        },
      });

      // Merge del UI stream (texto y otros datos)
      writer.merge(result.toUIMessageStream());
    },
  });

  return createUIMessageStreamResponse({ stream });
};

/**
 * Versión simplificada sin streaming dual
 * (para debugging o uso básico)
 */
export const tutorSimple = async (prompt: string) => {
  const result = await tutorAgent.generate({
    prompt,
  });

  return {
    text: result.text,
    code: null as string | null,
  };
};
