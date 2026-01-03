import { generateText, generateImage } from "ai";
import { openai } from "@ai-sdk/openai";
import OpenAI, { toFile } from "openai";

const textModel = openai("gpt-4o-mini");
const imageModel = openai.image("gpt-image-1-mini");
const openaiClient = new OpenAI();

export const STYLES = {
  vibrant: "Vibrant, bold colors, high contrast, energetic",
  minimal: "Minimalist, clean, white space, elegant",
  dramatic: "Cinematic, dark tones, intense lighting",
  tech: "Futuristic, neon accents, digital aesthetic",
} as const;

export type Style = keyof typeof STYLES;

const FORMATS = {
  youtube: "1536x1024",
  instagram: "1024x1024",
  story: "1024x1536",
} as const;

type Format = keyof typeof FORMATS;

// Genera prompt optimizado para thumbnail
async function createPrompt(title: string, style: Style): Promise<string> {
  const { text } = await generateText({
    model: textModel,
    prompt: `Crea un prompt de imagen para thumbnail de YouTube.
Título: "${title}"
Estilo: ${STYLES[style]}

Incluye: texto grande y bold (2-3 palabras clave), sujeto visual, colores específicos.
Máximo 100 palabras. Solo el prompt, sin explicaciones.`,
  });
  return text;
}

// PASO 1: Genera 4 previews (1 por estilo)
export async function generatePreviews(title: string) {
  const styles = Object.keys(STYLES) as Style[];

  const results = await Promise.allSettled(
    styles.map(async (style) => {
      const prompt = await createPrompt(title, style);
      const { image } = await generateImage({
        model: imageModel,
        prompt,
        size: "1024x1024",
      });
      return { id: style, style, prompt, image: image.base64 };
    })
  );

  // Filtrar exitosos
  const previews = results
    .map((result, i) => {
      if (result.status === "fulfilled") return result.value;
      console.error(`❌ Error generando ${styles[i]}:`, result.reason?.message);
      return null;
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);

  if (previews.length === 0) {
    throw new Error("No se pudo generar ningún preview");
  }

  return { previews };
}

// PASO 2: Genera 3 formatos usando imagen de referencia
export async function generateFormats(referenceBase64: string, prompt: string) {
  const formats: Format[] = ["youtube", "instagram", "story"];

  // Convertir base64 a File para la API
  const imageFile = await toFile(
    Buffer.from(referenceBase64, "base64"),
    "reference.png",
    { type: "image/png" }
  );

  // Promise.allSettled para manejar fallos individuales sin abortar todo
  const results = await Promise.allSettled(
    formats.map(async (format) => {
      const response = await openaiClient.images.edit({
        model: "gpt-image-1",
        image: imageFile,
        prompt: `${prompt}\n\nMantén el mismo diseño y estilo.`,
        size: FORMATS[format] as "1024x1024" | "1536x1024" | "1024x1536",
      });

      // gpt-image-1 devuelve b64_json por defecto
      const b64 = response.data[0]?.b64_json;
      if (!b64) {
        throw new Error(`No image data for ${format}`);
      }

      return { format, image: b64 };
    })
  );

  // Filtrar solo los exitosos, logear los fallidos
  const successful = results
    .map((result, i) => {
      if (result.status === "fulfilled") {
        return result.value;
      }
      console.error(`❌ Error generando ${formats[i]}:`, result.reason?.message || result.reason);
      return null;
    })
    .filter((r): r is { format: Format; image: string } => r !== null);

  if (successful.length === 0) {
    throw new Error("No se pudo generar ningún formato");
  }

  return successful;
}
