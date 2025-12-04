# Enviando datos personalizados (Artifacts)

Este ejercicio demuestra cómo enviar datos personalizados al cliente usando `createUIMessageStream` y `createUIMessageStreamResponse`, permitiendo crear experiencias como **artifacts** (paneles de código separados del chat).

## Conceptos clave

### createUIMessageStream

Crea un stream que permite enviar diferentes tipos de datos al cliente:

```ts
const stream = createUIMessageStream({
  execute: async ({ writer }) => {
    // Señalar inicio del stream
    writer.write({ type: "start" });

    // Enviar datos personalizados (ej: código para artifact)
    writer.write({
      type: "data-custom",
      data: { custom: "tu contenido aquí" },
    });

    // Combinar con un stream de texto del modelo
    const result = streamText({ model, prompt });
    writer.merge(result.toUIMessageStream());
  },
});
```

### Flujo de artifact

El patrón implementado en este ejercicio:

1. **Generar código** con streaming hacia el artifact
2. **Acumular el código** mientras se envía
3. **Explicar el código** en el chat (el modelo ya conoce qué se generó)

```ts
// 1. Generar código y acumularlo
let fullCode = "";
const codeResult = streamText({ model, prompt: userPrompt });

for await (const chunk of codeResult.textStream) {
  fullCode += chunk;
  writer.write({
    type: "data-custom",
    data: { custom: chunk },
  });
}

// 2. Chat "artifact-aware" - sabe qué código se generó
const chatResult = streamText({
  model,
  system: `CÓDIGO GENERADO:\n${fullCode}\n\nExplica brevemente...`,
  prompt: userPrompt,
});

writer.merge(chatResult.toUIMessageStream());
```

### Cliente React

En el cliente, filtramos las partes `data-custom` para renderizar el artifact:

```tsx
const artifactContent = useMemo(() => {
  return messages
    .flatMap((message) => message.parts)
    .filter((part) => part.type === "data-custom")
    .map((part) => part.data.custom)
    .join("");
}, [messages]);
```

## Archivos principales

| Archivo | Descripción |
|---------|-------------|
| `index.ts` | Función `chat_with_artifact` con el flujo de streaming dual |
| `client/src/App.tsx` | UI con panel de artifact y chat side-by-side |

## Ejecución

```bash
npm install
cd client && npm install && cd ..
npm run dev
```

## Resultado

- **Panel izquierdo (Artifact):** Muestra el código generado en tiempo real
- **Panel derecho (Chat):** Muestra la explicación del código

El modelo genera código y luego lo explica, manteniendo contexto de lo que ya se generó.
