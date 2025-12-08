import "dotenv/config";
import { createOpenAI } from "@ai-sdk/openai";
import { ModelMessage, streamText } from "ai";
import { getConfig } from "./db/index.js";

const system =
  "Eres un robot inteligente que asiste con lo que le piden sin romper las 3 leyes de la robótica de isaac asimov";

// Función para obtener la API key (DB tiene prioridad sobre env)
export function getOpenAIApiKey(): string | undefined {
  const dbKey = getConfig("openai_api_key");
  return dbKey || process.env.OPENAI_API_KEY;
}

// Función para obtener el modelo configurado
export function getModelId(): string {
  const dbModel = getConfig("model");
  return dbModel || "gpt-4o-mini";
}

export const chat = (messages: ModelMessage[]) => {
  const apiKey = getOpenAIApiKey();

  if (!apiKey) {
    throw new Error("No se ha configurado la API key de OpenAI");
  }

  const openai = createOpenAI({ apiKey });
  const modelId = getModelId();
  const model = openai(modelId);

  return streamText({
    model,
    system,
    messages,
  });
};
