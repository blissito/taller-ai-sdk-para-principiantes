import { generateText, generateImage } from "ai";
import { openai } from "@ai-sdk/openai";

const visionModel = openai("gpt-4o-mini");
const imageModel = openai.image("gpt-image-1");

/**
 * Analiza una imagen y genera una descripción de la persona
 */
export async function analyzePhoto(imageBase64: string): Promise<string> {
  const result = await generateText({
    model: visionModel,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Describe a esta persona de forma detallada para poder recrearla en un meme.
Incluye: apariencia física, ropa, pose, expresión facial, y cualquier detalle distintivo.
Sé específico pero conciso. NO incluyas nombres ni información personal.
Responde en español.`,
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

/**
 * Genera un meme basado en la descripción de la persona y el contexto
 */
export async function generateMeme(
  personDescription: string,
  memeContext: string
): Promise<string> {
  // Crear el prompt del meme
  const memePrompt = `Create a funny meme image in cartoon/comic style.

SUBJECT: ${personDescription}

MEME CONTEXT/SITUATION: "${memeContext}"

Style: Exaggerated, humorous, meme-worthy.
The person should be clearly recognizable based on the description.
Make it funny and shareable.
DO NOT include any text in the image.`;

  console.log("🎨 Generating meme with prompt:", memePrompt);

  const result = await generateImage({
    model: imageModel,
    prompt: memePrompt,
    size: "1024x1024",
    providerOptions: {
      openai: {
        style: "vivid",
      },
    },
  });

  // Retornar la imagen en base64
  return result.image.base64;
}

/**
 * Flujo completo: analizar foto → generar meme
 */
export async function createMemeFromPhoto(
  photoBase64: string,
  memeContext: string
): Promise<{
  description: string;
  memeImage: string;
}> {
  console.log("📸 Analyzing photo...");
  const description = await analyzePhoto(photoBase64);
  console.log("📝 Description:", description);

  console.log("🎭 Creating meme...");
  const memeImage = await generateMeme(description, memeContext);

  return {
    description,
    memeImage,
  };
}

/**
 * Genera un meme solo desde texto (sin foto)
 */
export async function generateMemeFromText(prompt: string): Promise<string> {
  const memePrompt = `Create a funny meme image in cartoon/comic style.

SCENE: ${prompt}

Style: Exaggerated, humorous, meme-worthy, colorful.
Make it funny and shareable.
DO NOT include any text in the image - the text will be added separately.`;

  const result = await generateImage({
    model: imageModel,
    prompt: memePrompt,
    size: "1024x1024",
    providerOptions: {
      openai: {
        style: "vivid",
      },
    },
  });

  return result.image.base64;
}
