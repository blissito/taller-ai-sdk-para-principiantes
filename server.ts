import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { chat, chat_with_artifact } from ".";
import { chunkFile } from "./chunking";
import { embedChunks, storeEmbeddings, findSimilarChunks } from "./embeddings";
import { createUIMessageStream } from "ai";

const PORT = Number(process.env.PORT) || 3000;
const app = new Hono();

// POST /api/embed - Crear embeddings
app.post("/api/embed", async (c) => {
  const { content, filename, sessionId } = await c.req.json();

  if (!content || !sessionId) {
    return c.json({ error: "content y sessionId son requeridos" }, 400);
  }

  try {
    const chunks = chunkFile(content, filename || "unknown", {
      maxChunkSize: 500,
      overlap: 50,
    });
    console.log(`Creados ${chunks.length} chunks para ${filename}`);

    const embeddedChunks = await embedChunks(chunks);
    storeEmbeddings(sessionId, embeddedChunks);
    console.log(`Embeddings almacenados para sesión ${sessionId}`);

    return c.json({ success: true, chunksCount: chunks.length, filename });
  } catch (error) {
    console.error("Error creando embeddings:", error);
    return c.json({ error: "Error procesando archivo" }, 500);
  }
});

// POST /api/search - Buscar chunks similares
app.post("/api/search", async (c) => {
  const { query, sessionId, topK = 3 } = await c.req.json();

  if (!query || !sessionId) {
    return c.json({ error: "query y sessionId son requeridos" }, 400);
  }

  try {
    const results = await findSimilarChunks(sessionId, query, topK);
    return c.json({ results });
  } catch (error) {
    console.error("Error buscando:", error);
    return c.json({ error: "Error en búsqueda" }, 500);
  }
});

// POST /api/chat - Chat con streaming
app.post("/api/chat", async (c) => {
  const { messages, sessionId } = await c.req.json();
  const result = chat(messages, sessionId);
  return result.toUIMessageStreamResponse();
});

// Sending custom data in a merged stream
app.post("/api/chat_with_artifact", async (c) => {
  const { messages, sessionId } = await c.req.json();
  return chat_with_artifact({ messages, sessionId }); // Returns Response
});

// Servir frontend estático
app.use("/*", serveStatic({ root: "./client/dist" }));

serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.info(`Running on port: ${info.port}`);
});
