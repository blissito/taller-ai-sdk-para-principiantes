import { openai } from "@ai-sdk/openai";
import { embedMany, embed, cosineSimilarity } from "ai";
import type { Chunk } from "./chunking";

const embeddingModel = openai.embedding("text-embedding-3-small");

export type EmbeddedChunk = Chunk & {
  embedding: number[];
};

// Almacén en memoria para los embeddings
const embeddingStore: Map<string, EmbeddedChunk[]> = new Map();

/**
 * Genera embeddings para un array de chunks
 */
export async function embedChunks(chunks: Chunk[]): Promise<EmbeddedChunk[]> {
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: chunks.map((c) => c.content),
  });

  return chunks.map((chunk, i) => ({
    ...chunk,
    embedding: embeddings[i],
  }));
}

/**
 * Almacena chunks con sus embeddings
 */
export function storeEmbeddings(
  sessionId: string,
  chunks: EmbeddedChunk[]
): void {
  const existing = embeddingStore.get(sessionId) || [];
  embeddingStore.set(sessionId, [...existing, ...chunks]);
}

/**
 * Obtiene todos los chunks almacenados para una sesión
 */
export function getStoredChunks(sessionId: string): EmbeddedChunk[] {
  return embeddingStore.get(sessionId) || [];
}

/**
 * Limpia los embeddings de una sesión
 */
export function clearEmbeddings(sessionId: string): void {
  embeddingStore.delete(sessionId);
}

/**
 * Calcula la similitud coseno entre dos vectores
 */
// function cosineSimilarity(a: number[], b: number[]): number {
//   let dotProduct = 0;
//   let normA = 0;
//   let normB = 0;

//   for (let i = 0; i < a.length; i++) {
//     dotProduct += a[i] * b[i];
//     normA += a[i] * a[i];
//     normB += b[i] * b[i];
//   }

//   return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
// }

/**
 * Busca los chunks más similares a una query
 */
export async function findSimilarChunks(
  sessionId: string,
  query: string,
  topK: number = 3
): Promise<{ chunk: Chunk; similarity: number }[]> {
  const storedChunks = getStoredChunks(sessionId);
  if (storedChunks.length === 0) return [];

  // Generar embedding de la query
  const { embedding: queryEmbedding } = await embed({
    model: embeddingModel,
    value: query,
  });

  // Calcular similitud con cada chunk 🤯
  const scored = storedChunks.map((chunk) => ({
    chunk: {
      content: chunk.content,
      index: chunk.index,
      metadata: chunk.metadata,
    },
    similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));

  // Ordenar por similitud y retornar top K
  return scored.sort((a, b) => b.similarity - a.similarity).slice(0, topK);
}
