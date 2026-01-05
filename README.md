# Ejercicio 06: Artifacts con createUIMessageStream

Implementamos un patrón de "artifacts" donde generamos código en un panel separado mientras el chat explica lo generado. Usamos `createUIMessageStream` para enviar datos personalizados al cliente.

## Flujo de la aplicación

```
[Usuario: "Crea un botón React"]
              ↓
     createUIMessageStream
              ↓
┌─────────────────────────────────────┐
│  PASO 1: Generar código             │
│  streamText → fullCode              │
│  writer.write({ type: "data-custom"})│
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  PASO 2: Explicar código            │
│  streamText con fullCode en system  │
│  writer.merge(toUIMessageStream())  │
└─────────────────────────────────────┘
              ↓
┌──────────────────┬──────────────────┐
│   ARTIFACT       │      CHAT        │
│   (código)       │   (explicación)  │
│                  │                  │
│ ```tsx           │ El botón usa     │
│ function Button  │ useState para... │
│ ```              │                  │
└──────────────────┴──────────────────┘
```

## Conceptos del AI SDK

### createUIMessageStream

Crea un stream que permite enviar diferentes tipos de datos al cliente:

```ts
import { createUIMessageStream, createUIMessageStreamResponse } from "ai";

const stream = createUIMessageStream({
  execute: async ({ writer }) => {
    // Señalar inicio
    writer.write({ type: "start" });

    // Enviar datos personalizados
    writer.write({
      type: "data-custom",
      data: { custom: "contenido para artifact" },
    });

    // Combinar con stream de texto
    const result = streamText({ model, prompt });
    writer.merge(result.toUIMessageStream());
  },
});

return createUIMessageStreamResponse({ stream });
```

| Método | Descripción |
|--------|-------------|
| `writer.write({ type: "start" })` | Señala inicio del stream |
| `writer.write({ type: "data-custom", data })` | Envía datos personalizados |
| `writer.merge(stream)` | Combina con otro stream |
| `createUIMessageStreamResponse({ stream })` | Crea Response HTTP |

### Patrón artifact-aware

El modelo conoce el código generado para explicarlo:

```ts
export const chat_with_artifact = (data: { messages: UIMessage[] }) => {
  const userPrompt = /* extraer texto del mensaje */;

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      writer.write({ type: "start" });

      // 1. Generar código y acumularlo
      let fullCode = "";
      const codeResult = streamText({
        model,
        system: "Genera solo código React/TypeScript limpio",
        prompt: userPrompt,
      });

      for await (const chunk of codeResult.textStream) {
        fullCode += chunk;
        writer.write({
          type: "data-custom",
          data: { custom: chunk },
        });
      }

      // 2. Chat "artifact-aware" - conoce el código
      const chatResult = streamText({
        model,
        system: `CÓDIGO GENERADO:\n${fullCode}\n\nExplica brevemente...`,
        prompt: userPrompt,
      });

      writer.merge(chatResult.toUIMessageStream());
    },
  });

  return createUIMessageStreamResponse({ stream });
};
```

### Cliente: Filtrando data-custom

En React, filtramos las partes `data-custom` para el artifact:

```tsx
const artifactContent = useMemo(() => {
  return messages
    .flatMap((message) => message.parts)
    .filter((part) => part.type === "data-custom")
    .map((part) => part.data.custom)
    .join("");
}, [messages]);
```

### DefaultChatTransport

Cambiamos el endpoint del chat:

```tsx
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

const { messages, sendMessage } = useChat({
  transport: new DefaultChatTransport({
    api: "/api/chat_with_artifact",
  }),
});
```

## Layout side-by-side

```tsx
<article className="flex items-stretch">
  {isArtifactPresent && (
    <section id="Artifact" className="min-w-[60vw] bg-blue-950">
      <Streamdown>{artifactContent}</Streamdown>
    </section>
  )}

  <motion.section layout id="Chat" className="flex-1">
    {/* Mensajes de texto */}
    {messages.map((m) => (
      <div key={m.id}>
        {m.parts.map((part, i) => {
          if (part.type === "text") {
            return <Streamdown key={i}>{part.text}</Streamdown>;
          }
          return null;
        })}
      </div>
    ))}
  </motion.section>
</article>
```

## Estructura del proyecto

```
├── index.ts           # chat() y chat_with_artifact()
├── server.ts          # /api/chat y /api/chat_with_artifact
├── cursos.ts          # Datos de cursos
├── system.txt         # System prompt
└── client/
    └── src/
        ├── App.tsx           # Layout artifact + chat
        ├── components/
        │   └── CursoCard.tsx
        └── lib/
            └── utils.ts      # cn() helper
```

## API Endpoints

```bash
# Chat normal con tools
POST /api/chat
{ "messages": [...], "sessionId": "uuid" }

# Chat con artifacts
POST /api/chat_with_artifact
{ "messages": [...], "sessionId": "uuid" }
```

## Ejecución

```bash
npm install
cd client && npm install && cd ..
npm run dev
```

## Resultado

- **Panel izquierdo (Artifact):** Código generado en tiempo real con syntax highlighting
- **Panel derecho (Chat):** Explicación del código que conoce lo generado

El modelo genera código y luego lo explica, manteniendo contexto de lo que ya se generó.

## Lo que aprenderás

1. **createUIMessageStream** - Crear streams personalizados
2. **writer.write({ type: "data-custom" })** - Enviar datos al cliente
3. **writer.merge()** - Combinar múltiples streams
4. **Artifact pattern** - Código en panel separado
5. **DefaultChatTransport** - Cambiar endpoint del chat
6. **Layout dinámico** - Motion para animaciones de layout

---

Que lo disfrutes. Abrazo. bliss
