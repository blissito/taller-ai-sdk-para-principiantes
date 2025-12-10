import "dotenv/config";
import { openai } from "@ai-sdk/openai";
import { streamText, generateObject, streamObject } from "ai";
import { z } from "zod";

const model = openai("gpt-4.1-mini");

const system =
  "Eres un robot inteligente que asiste con lo que le piden sin romper las 3 leyes de la robótica de isaac asimov";

// ============================================
// 1. STREAM TEXT - Generación de texto básica
// ============================================
const chat = (prompt: string) =>
  streamText({
    model,
    system,
    prompt,
  });

const { textStream } = chat("Díme un poema robótico");

for await (const part of textStream) {
  process.stdout.write(part);
}

// ============================================
// 2. GENERATE OBJECT - Datos estructurados
// ============================================
// Descomenta para probar:

// const recipeSchema = z.object({
//   recipe: z.object({
//     name: z.string(),
//     ingredients: z.array(
//       z.object({
//         name: z.string(),
//         amount: z.string(),
//       })
//     ),
//     steps: z.array(z.string()),
//   }),
// });

// const { object } = await generateObject({
//   model,
//   schema: recipeSchema,
//   prompt: "Dame una receta de tacos al pastor",
// });

// console.log("\n\n=== RECETA GENERADA ===");
// console.log("Nombre:", object.recipe.name);
// console.log("Ingredientes:", object.recipe.ingredients);
// console.log("Pasos:", object.recipe.steps);

// ============================================
// 3. STREAM OBJECT - Datos estructurados en streaming
// ============================================
// Descomenta para probar (comenta el generateObject primero):

// const { partialObjectStream } = streamObject({
//   model,
//   schema: recipeSchema,
//   prompt: "Dame una receta de enchiladas verdes",
// });

// for await (const partialObject of partialObjectStream) {
//   console.clear();
//   console.log("Construyendo objeto...");
//   console.log(JSON.stringify(partialObject, null, 2));
// }

// ⚠️ Nota: generateObject y streamObject NO pueden usar tools
