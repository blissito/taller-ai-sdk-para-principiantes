# Agentes con ToolLoopAgent

En este ejercicio exploramos `ToolLoopAgent` del AI SDK 6 para crear un **tutor de TypeScript**. Esta clase implementa el patrón de agente con loop de herramientas automático.

## Conceptos clave

### ToolLoopAgent

La clase `ToolLoopAgent` encapsula el loop completo: llama al LLM, ejecuta herramientas, agrega resultados a la conversación, y repite hasta completar.

```ts
import { ToolLoopAgent, tool, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

const model = openai("gpt-4o-mini");

export const tutorAgent = new ToolLoopAgent({
  model,
  instructions: `Eres un tutor de TypeScript amigable.
    SIEMPRE usa generateCode para crear ejemplos.`,

  tools: {
    generateCode: tool({
      description: "Genera código TypeScript ejecutable",
      inputSchema: z.object({
        topic: z.string().describe("El tema del código"),
        title: z.string().describe("Título del ejemplo"),
        code: z.string().describe("Código completo"),
      }),
      execute: async ({ topic, title, code }) => {
        return { topic, title, code, success: true };
      },
    }),
  },

  stopWhen: stepCountIs(5), // Default es 20, reducimos a 5 para este tutor
});
```

### Parámetros clave

| Parámetro | Descripción |
|-----------|-------------|
| `model` | El modelo LLM a usar |
| `instructions` | Define el comportamiento del agente (renombrado de `system` en v6) |
| `tools` | Objeto con las herramientas disponibles |
| `stopWhen` | Condición de parada (default: `stepCountIs(20)`) |

### Control del loop con stopWhen

Por defecto el agente se detiene después de **20 pasos** (`stepCountIs(20)`). Puedes personalizar:

```ts
import { stepCountIs, hasToolCall } from "ai";

// Detener después de 5 pasos
stopWhen: stepCountIs(5)

// Detener cuando se llame una herramienta específica
stopWhen: hasToolCall("finalAnswer")

// Combinar condiciones (se detiene cuando CUALQUIERA se cumple)
stopWhen: [stepCountIs(10), hasToolCall("done")]
```

El loop también se detiene automáticamente cuando:
- El modelo genera texto sin llamar herramientas
- Una herramienta no tiene función `execute`
- Una llamada requiere aprobación del usuario

### Definiendo tools

Las herramientas usan `inputSchema` (esquema Zod) y `execute`:

```ts
generateCode: tool({
  description: "Descripción para el modelo",
  inputSchema: z.object({
    topic: z.string().describe("Descripción del parámetro"),
  }),
  execute: async ({ topic }) => {
    // Lógica de la herramienta
    return { resultado: "..." };
  },
}),
```

### Métodos del agente

```ts
// Generación completa (espera el resultado)
const result = await tutorAgent.generate({
  prompt: "Explícame interfaces",
});
console.log(result.text);

// Streaming (para UI en tiempo real)
const result = await tutorAgent.stream({
  messages: modelMessages,
});
```

### Capturando tool results con fullStream

Para reaccionar cuando el agente ejecuta herramientas, iteramos sobre `fullStream`:

```ts
for await (const part of result.fullStream) {
  if (part.type === "tool-result" && part.toolName === "generateCode") {
    // part.output contiene el resultado de la herramienta
    const output = part.output as { topic: string; title: string; code: string };

    writer.write({
      type: "data-custom",
      data: { type: "code", ...output },
    });
  }
}
```

### Streaming dual con UIMessageStream

Combinamos captura de herramientas con streaming de texto:

```ts
export const tutor = (messages: UIMessage[]) => {
  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      const modelMessages = await convertToModelMessages(messages);

      const result = await tutorAgent.stream({
        messages: modelMessages,
      });

      // Capturar tool results → artifact
      for await (const part of result.fullStream) {
        if (part.type === "tool-result" && part.toolName === "generateCode") {
          writer.write({
            type: "data-custom",
            data: { type: "code", ...part.output },
          });
        }
      }

      // Texto → chat
      writer.merge(result.toUIMessageStream());
    },
  });

  return createUIMessageStreamResponse({ stream });
};
```

## Ejecutando código con Sandpack

El cliente usa [Sandpack](https://sandpack.codesandbox.io) de CodeSandbox para ejecutar el código TypeScript generado:

```tsx
import {
  SandpackProvider,
  SandpackCodeEditor,
  SandpackPreview,
} from "@codesandbox/sandpack-react";

// Cuando el agente genera código, lo mostramos en Sandpack
{codeArtifact && (
  <SandpackProvider
    template="vanilla-ts"
    theme="dark"
    files={{
      "/index.ts": codeArtifact.code,
    }}
    options={{ autorun: true }}
  >
    <SandpackCodeEditor showLineNumbers />
    <SandpackPreview />
  </SandpackProvider>
)}
```

El código se ejecuta automáticamente y puedes ver los `console.log` en el preview.

## Archivos principales

| Archivo | Descripción |
|---------|-------------|
| `typescript-tutor.ts` | Definición del agente con ToolLoopAgent |
| `server.ts` | Servidor Hono con endpoint `/api/chat` |
| `client/src/App.tsx` | UI con Sandpack + chat |

## Ejecución

```bash
npm install
cd client && npm install && cd ..
npm run dev
```

## Resultado

- **Panel izquierdo:** Código TypeScript generado por la herramienta
- **Panel derecho:** Explicación del tutor en el chat

El agente decide cuándo llamar `generateCode`, genera el ejemplo, y luego lo explica.

## ToolLoopAgent vs streamText + maxSteps

| Aspecto | streamText + maxSteps | ToolLoopAgent |
|---------|----------------------|---------------|
| Configuración | Por llamada | Una vez, reutilizable |
| System prompt | `system: "..."` | `instructions: "..."` |
| Control del loop | `maxSteps: N` | `stopWhen: stepCountIs(N)` |
| Instancia | Nueva cada vez | Agente persistente |

`ToolLoopAgent` es más declarativo y encapsula el comportamiento del agente en una clase reutilizable.

Que lo disfrutes. Abrazo. bliss 🦾
