import "dotenv/config";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

const model = openai("gpt-4o-mini");

const system =
  "Eres un robot inteligente que asiste con lo que le piden sin romper las 3 leyes de la rob�tica de isaac asimov";

export const chat = (prompt: string) =>
  streamText({
    model,
    system,
    prompt,
  });
