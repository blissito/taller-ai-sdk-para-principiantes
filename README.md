# Ejercicio 00: Inferencia básica con AI SDK

Este es el punto de partida del taller. Aprendemos a generar texto y datos estructurados usando el AI SDK de Vercel desde un script de Node.js.

## Flujo de la aplicación

```
[Script Node.js]
       ↓
   streamText()
       ↓
   textStream
       ↓
   for await (part)
       ↓
[Consola: texto en tiempo real]
```

## Conceptos del AI SDK

### streamText

Genera texto en streaming (token por token):

```ts
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

const model = openai("gpt-4.1-mini");

const chat = (prompt: string) =>
  streamText({
    model,
    system: "Eres un asistente inteligente",
    prompt,
  });

// Consumir el stream
const { textStream } = chat("Díme un poema robótico");

for await (const part of textStream) {
  process.stdout.write(part); // Sin salto de línea
}
```

| Función | Descripción | Retorna |
|---------|-------------|---------|
| `streamText` | Genera texto en streaming | `{ textStream, text, ... }` |
| `generateText` | Genera texto completo | `{ text, ... }` |

### generateObject

Genera datos estructurados validados con Zod:

```ts
import { generateObject } from "ai";
import { z } from "zod";

const recipeSchema = z.object({
  recipe: z.object({
    name: z.string(),
    ingredients: z.array(
      z.object({
        name: z.string(),
        amount: z.string(),
      })
    ),
    steps: z.array(z.string()),
  }),
});

const { object } = await generateObject({
  model,
  schema: recipeSchema,
  prompt: "Dame una receta de tacos al pastor",
});

console.log(object.recipe.ingredients); // Tipado y validado
```

### streamObject

Genera objetos en streaming (útil para UIs):

```ts
import { streamObject } from "ai";

const { partialObjectStream } = streamObject({
  model,
  schema: recipeSchema,
  prompt: "Dame una receta de enchiladas",
});

for await (const partialObject of partialObjectStream) {
  console.clear();
  console.log(partialObject); // El objeto se va construyendo
}
```

| Función | Streaming | Datos estructurados | Tools |
|---------|-----------|---------------------|-------|
| `streamText` | Si | No | Si |
| `generateText` | No | No | Si |
| `streamObject` | Si | Si | No |
| `generateObject` | No | Si | No |

## Casos de uso de datos estructurados

- Formularios inteligentes
- Extracción de datos de documentos
- Clasificadores de texto
- Analizadores de sentimiento
- Parseo de CVs

## Estructura del proyecto

```
├── index.ts       # Script principal con ejemplos
├── package.json   # Dependencias (ai, @ai-sdk/openai)
└── .env           # OPENAI_API_KEY
```

## Ejecución

```bash
# Instalar dependencias
npm install

# Ejecutar script
npm run dev  # equivale a: tsx index.ts
```

## Siguiente paso

En el siguiente ejercicio crearemos un servidor Express para exponer el chat como API web.

> Hay una branch bonus donde usamos Hono en vez de Express: `ejercicio/bonus-migrate_to_hono`

## Lo que aprenderás

1. **streamText** - Generar texto en streaming
2. **textStream** - Consumir stream con for await
3. **generateObject** - Datos estructurados con Zod
4. **streamObject** - Objetos en streaming
5. **Modelos OpenAI** - Configurar el provider

---

Que lo disfrutes. Abrazo. bliss
