# Ejercicio 06: Artifacts con createUIMessageStream

¿Has visto cómo Claude o ChatGPT muestran código en un panel separado mientras te explican qué hace? Eso es el patrón de **artifacts**. Y en este ejercicio vamos a implementarlo. 🎨

La idea es simple: generar código en un lugar, y explicarlo en otro. Pero el modelo tiene que **saber** qué código generó para poder explicarlo. Eso es lo que llamamos un chat "artifact-aware".

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

## El problema que resolvemos

Cuando usamos `streamText`, los chunks de texto van al chat. Pero ¿qué pasa si queremos enviar **otro tipo de datos** al cliente? Por ejemplo, código que debe ir a un panel separado.

Aquí es donde entra `createUIMessageStream`. Nos permite enviar datos personalizados al cliente. 🚀

## createUIMessageStream: La herramienta clave

Esta función crea un stream que permite enviar diferentes tipos de datos:

```ts
import { createUIMessageStream, createUIMessageStreamResponse } from "ai";

const stream = createUIMessageStream({
  execute: async ({ writer }) => {
    // Señalar inicio
    writer.write({ type: "start" });

    // Enviar datos personalizados (van al artifact)
    writer.write({
      type: "data-custom",
      data: { custom: "código aquí" },
    });

    // Combinar con stream de texto (va al chat)
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

## El patrón artifact-aware

La clave está en que el chat **conozca** el código generado. Primero generamos el código, lo acumulamos, y luego se lo pasamos al chat en el system prompt:

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
          data: { custom: chunk },  // 👈 Va al artifact
        });
      }

      // 2. Chat "artifact-aware" - SABE qué código se generó
      const chatResult = streamText({
        model,
        system: `CÓDIGO GENERADO:\n${fullCode}\n\nExplica brevemente...`,
        prompt: userPrompt,
      });

      writer.merge(chatResult.toUIMessageStream()); // 👈 Va al chat
    },
  });

  return createUIMessageStreamResponse({ stream });
};
```

¿Ves el truco? Acumulamos `fullCode` mientras streameamos al artifact, y luego lo inyectamos en el system prompt del chat. El modelo ahora **sabe exactamente** qué código explicar. ✨

## En el cliente: Filtrando los datos

En React, filtramos las partes `data-custom` para el artifact y las partes `text` para el chat:

```tsx
const artifactContent = useMemo(() => {
  return messages
    .flatMap((message) => message.parts)
    .filter((part) => part.type === "data-custom")
    .map((part) => part.data.custom)
    .join("");
}, [messages]);
```

Y el layout lado a lado:

```tsx
<article className="flex items-stretch">
  {isArtifactPresent && (
    <section id="Artifact" className="min-w-[60vw] bg-blue-950">
      <Streamdown>{artifactContent}</Streamdown>
    </section>
  )}

  <motion.section layout id="Chat" className="flex-1">
    {/* Solo partes de texto */}
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

## Cambiando el endpoint con DefaultChatTransport

Para usar nuestro nuevo endpoint `/api/chat_with_artifact`, usamos `DefaultChatTransport`:

```tsx
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

const { messages, sendMessage } = useChat({
  transport: new DefaultChatTransport({
    api: "/api/chat_with_artifact",
  }),
});
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
        └── components/
            └── CursoCard.tsx
```

## Ejecución

```bash
npm install
cd client && npm install && cd ..
npm run dev
```

## Lo que aprenderás

1. **createUIMessageStream** - Crear streams personalizados
2. **writer.write({ type: "data-custom" })** - Enviar datos al cliente
3. **writer.merge()** - Combinar múltiples streams
4. **Artifact pattern** - Código en panel separado
5. **DefaultChatTransport** - Cambiar endpoint del chat
6. **Layout dinámico** - Framer Motion para animaciones

---

📺 **[Ver el curso completo en video](https://www.fixtergeek.com/cursos/ai-sdk/viewer)**

Que lo disfrutes. Abrazo. bliss 🦾
