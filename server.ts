import express from "express";
import { chat } from ".";
import { chunkFile } from "./chunking";
import { embedChunks, storeEmbeddings, findSimilarChunks } from "./embeddings";

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json({ limit: "10mb" }));

// Endpoint para crear embeddings de un archivo
app.post("/api/embed", async (req, res) => {
  const { content, filename, sessionId } = req.body;

  if (!content || !sessionId) {
    return res
      .status(400)
      .json({ error: "content y sessionId son requeridos" });
  }

  try {
    // 1. Crear chunks del contenido
    const chunks = chunkFile(content, filename || "unknown", {
      maxChunkSize: 500,
      overlap: 50,
    });

    console.log(`Creados ${chunks.length} chunks para ${filename}`);

    // 2. Generar embeddings para cada chunk
    const embeddedChunks = await embedChunks(chunks);

    // 3. Almacenar en memoria
    storeEmbeddings(sessionId, embeddedChunks);

    console.log(`Embeddings almacenados para sesión ${sessionId}`);

    res.json({
      success: true,
      chunksCount: chunks.length,
      filename,
    });
  } catch (error) {
    console.error("Error creando embeddings:", error);
    res.status(500).json({ error: "Error procesando archivo" });
  }
});

// Endpoint para buscar chunks similares
app.post("/api/search", async (req, res) => {
  const { query, sessionId, topK = 3 } = req.body;

  if (!query || !sessionId) {
    return res.status(400).json({ error: "query y sessionId son requeridos" });
  }

  try {
    const results = await findSimilarChunks(sessionId, query, topK);
    res.json({ results });
  } catch (error) {
    console.error("Error buscando:", error);
    res.status(500).json({ error: "Error en búsqueda" });
  }
});

app.post("/api/chat", async (req, res) => {
  const { messages, sessionId } = req.body;

  // @TODO Save the conversation 🤓 and use "originalMessages" from AI SDK

  // Si hay sessionId, buscar contexto relevante
  let contextChunks: string[] = [];
  if (sessionId && messages.length > 0) {
    const lastMessage = messages[messages.length - 1];
    const userQuery: string =
      lastMessage.parts?.find((p: { type: string }) => p.type === "text")
        ?.text || "";

    // Se busca el contexto en cada mensaje, lo que lo convierte en un contexto en movimiento, mutable, mutante. 🫠
    if (userQuery) {
      const similar = await findSimilarChunks(sessionId, userQuery, 3);
      contextChunks = similar.map(
        (s) =>
          `[Similitud: ${(s.similarity * 100).toFixed(1)}%] ${s.chunk.content}`
      );
      console.info(`Encontrados ${contextChunks.length} chunks relevantes`);
    }
  }

  const result = chat(messages, contextChunks); // RAG
  result.pipeUIMessageStreamToResponse(res);
});

app.listen(PORT, () => {
  console.info("Running on port: " + PORT);
});
