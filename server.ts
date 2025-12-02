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

  // Pasar sessionId para que las tools puedan buscar en embeddings
  const result = chat(messages, sessionId);
  result.pipeUIMessageStreamToResponse(res);
});

app.listen(PORT, () => {
  console.info("Running on port: " + PORT);
});
