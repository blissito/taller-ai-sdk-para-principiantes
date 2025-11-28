import "dotenv/config";
import { openai } from "@ai-sdk/openai";
import { streamText, convertToModelMessages, type UIMessage } from "ai";

const model = openai("gpt-4.1-mini");

const system =
  "Eres un robot inteligente que asiste con lo que le piden sin romper las 3 leyes de la robotica de isaac asimov";

export const chat = (messages: UIMessage[]) =>
  streamText({
    model,
    system,
    messages: convertToModelMessages(messages),
  });
