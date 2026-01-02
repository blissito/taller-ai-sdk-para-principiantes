# Generación de imágenes con AI SDK

En este ejercicio exploramos `generateImage` del AI SDK para crear un **generador de memes**. Combinamos visión (análisis de fotos) con generación de imágenes para crear memes personalizados.

## Conceptos clave

### generateImage

Esta función nos permite generar imágenes usando modelos como DALL-E o GPT Image:

```ts
import { generateImage } from "ai";
import { openai } from "@ai-sdk/openai";

const imageModel = openai.image("gpt-image-1");

const result = await generateImage({
  model: imageModel,
  prompt: "Un gato programando en TypeScript",
  size: "1024x1024",
  providerOptions: {
    openai: {
      style: "vivid", // o "natural"
    },
  },
});

// La imagen viene en base64
const imageBase64 = result.image.base64;
```

### Combinando visión + generación

El flujo de este generador de memes es interesante porque combina dos capacidades:

1. **Analizar** una foto con un modelo de visión
2. **Generar** un meme basado en esa descripción

```ts
import { generateText, generateImage } from "ai";
import { openai } from "@ai-sdk/openai";

const visionModel = openai("gpt-4o-mini");
const imageModel = openai.image("gpt-image-1");

// 1. Analizar la foto
async function analyzePhoto(imageBase64: string): Promise<string> {
  const result = await generateText({
    model: visionModel,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Describe a esta persona de forma detallada...",
          },
          {
            type: "image",
            image: imageBase64,
          },
        ],
      },
    ],
  });
  return result.text;
}

// 2. Generar el meme
async function generateMeme(
  personDescription: string,
  context: string
): Promise<string> {
  const result = await generateImage({
    model: imageModel,
    prompt: `Create a funny meme. Subject: ${personDescription}. Situation: ${context}`,
    size: "1024x1024",
  });
  return result.image.base64;
}
```

### El flujo completo

La función principal encadena ambos pasos:

```ts
export async function createMemeFromPhoto(
  photoBase64: string,
  memeContext: string
) {
  // Primero analizamos la foto
  const description = await analyzePhoto(photoBase64);

  // Luego generamos el meme
  const memeImage = await generateMeme(description, memeContext);

  return { description, memeImage };
}
```

## Servidor con Hono

Usamos Hono como servidor (más ligero que Express):

```ts
import { Hono } from "hono";
import { createMemeFromPhoto, generateMemeFromText } from "./index.js";

const app = new Hono();

// Meme desde foto + contexto
app.post("/api/meme/from-photo", async (c) => {
  const { photo, context } = await c.req.json();
  const result = await createMemeFromPhoto(photo, context);
  return c.json(result);
});

// Meme solo desde texto
app.post("/api/meme/from-text", async (c) => {
  const { prompt } = await c.req.json();
  const memeImage = await generateMemeFromText(prompt);
  return c.json({ memeImage });
});
```

## Cliente React

El cliente permite subir una foto o escribir un prompt directamente:

```tsx
// Modo foto: seleccionar imagen
const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  const reader = new FileReader();
  reader.onload = (event) => {
    const result = event.target?.result as string;
    const base64 = result.split(",")[1]; // Solo el base64
    setPhotoBase64(base64);
  };
  reader.readAsDataURL(file);
};

// Generar meme
const response = await fetch("/api/meme/from-photo", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ photo: photoBase64, context: prompt }),
});
```

## Archivos principales

| Archivo | Descripción |
|---------|-------------|
| `meme-generator.ts` | Funciones de análisis y generación de memes |
| `server.ts` | Servidor Hono con endpoints de la API |
| `client/src/App.tsx` | UI para subir fotos y generar memes |

## Ejecución

```bash
npm install
cd client && npm install && cd ..
npm run dev
```

## Resultado

- **Modo texto:** Escribe un prompt y genera un meme directamente
- **Modo foto:** Sube una foto, agrega contexto, y el sistema:
  1. Analiza la foto con GPT-4o Vision
  2. Genera un meme caricaturizado basado en la descripción

El modelo de visión describe a la persona/escena, y luego el modelo de imágenes crea una versión meme.

Que lo disfrutes. Abrazo. bliss 🦾
