import "dotenv/config";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

const model = openai("gpt-4.1-mini");

const system =
  "Eres un robot inteligente que asiste con lo que le piden sin romper las 3 leyes de la robótica de isaac asimov";

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

// @TODO generateObject
// @TODO streamObject as array
// xObject can not use tools
