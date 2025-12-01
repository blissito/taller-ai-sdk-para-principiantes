import "dotenv/config";
import { readFileSync } from "fs";
import { openai } from "@ai-sdk/openai";
import { streamText, convertToModelMessages, type UIMessage } from "ai";

const model = openai("gpt-4.1-mini");

const system = readFileSync("system.txt", "utf-8");

export const chat = (messages: UIMessage[]) =>
  streamText({
    model,
    system,
    messages: convertToModelMessages(messages),
  });
