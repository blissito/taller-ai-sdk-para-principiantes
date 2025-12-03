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

export const chatWithPDF = (messages: UIMessage[]) => {
  const msgs = convertToModelMessages(messages);
  const fileAlreadyLoaded = msgs.find(
    (msj) => msj.role === "assistant" && msj.content[0].type === "file"
  );

  if (fileAlreadyLoaded) {
    return streamText({
      model,
      system,
      messages: msgs,
    });
  }

  return streamText({
    model,
    system,
    messages: [
      ...msgs,
      {
        role: "assistant",
        content: [
          {
            type: "file",
            mediaType: "application/pdf",
            data: readFileSync("/prompt.pdf"),
          },
        ],
      },
    ],
  });
};
