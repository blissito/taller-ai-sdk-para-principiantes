import "dotenv/config";
import { readFileSync } from "fs";
import { openai } from "@ai-sdk/openai";
import { streamText, convertToModelMessages, type UIMessage } from "ai";

const model = openai("gpt-4.1-mini");

const baseSystem = readFileSync("system.txt", "utf-8");

export const chat = (messages: UIMessage[], contextChunks: string[] = []) => {
  // Si hay contexto de embeddings, agregarlo al system prompt
  const system =
    contextChunks.length > 0
      ? `${baseSystem}\n\n## Contexto relevante encontrado por búsqueda semántica:\n${contextChunks.join("\n\n")}`
      : baseSystem;

  return streamText({
    model,
    system,
    messages: convertToModelMessages(messages),
  });
};
