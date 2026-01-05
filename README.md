# Ejercicio 04: Embeddings y RAG

Implementamos un sistema RAG (Retrieval Augmented Generation) que permite subir archivos, convertirlos en embeddings vectoriales, y hacer preguntas con contexto semántico relevante.

## Flujo de la aplicación

```
[Usuario sube archivo.txt]
         ↓
    CHUNKING
    (dividir en pedazos)
         ↓
    EMBEDDINGS
    (vectorizar cada chunk)
         ↓
    ALMACENAR
    (memoria por sessionId)
         ↓
[Usuario hace pregunta]
         ↓
    BÚSQUEDA SEMÁNTICA
    (cosineSimilarity)
         ↓
    RAG: Inyectar contexto
    en system prompt
         ↓
[Respuesta con contexto]
```

## Conceptos del AI SDK

### embedMany

Genera embeddings para múltiples textos en una sola llamada:

```ts
import { embedMany } from "ai";
import { openai } from "@ai-sdk/openai";

const embeddingModel = openai.embedding("text-embedding-3-small");

const { embeddings } = await embedMany({
  model: embeddingModel,
  values: ["texto 1", "texto 2", "texto 3"],
});

// embeddings es un array de vectores (number[][])
console.log(embeddings[0].length); // 1536 dimensiones
```

### embed

Genera embedding para un solo texto (útil para la query del usuario):

```ts
import { embed } from "ai";

const { embedding } = await embed({
  model: embeddingModel,
  value: "¿Cuál es el precio del producto?",
});
```

### cosineSimilarity

Calcula la similitud entre dos vectores (0 = nada similar, 1 = idénticos):

```ts
import { cosineSimilarity } from "ai";

const similarity = cosineSimilarity(vectorA, vectorB);
// 0.85 = muy similar
// 0.45 = algo relacionado
// 0.10 = poco relacionado
```

| Función | Uso | Retorna |
|---------|-----|---------|
| `embedMany` | Vectorizar múltiples textos | `{ embeddings: number[][] }` |
| `embed` | Vectorizar un texto | `{ embedding: number[] }` |
| `cosineSimilarity` | Comparar dos vectores | `number` (0 a 1) |

## Chunking: Dividir texto en pedazos

El archivo `chunking.ts` implementa varias estrategias para dividir texto:

```ts
import { chunkText } from "./chunking";

const chunks = chunkText(contenido, {
  maxChunkSize: 500,    // Máximo caracteres por chunk
  overlap: 50,          // Solapamiento entre chunks
  splitBy: "paragraph", // Estrategia de división
});
```

| Estrategia | Descripción |
|------------|-------------|
| `paragraph` | Divide por párrafos (doble salto de línea) |
| `sentence` | Divide por oraciones (., !, ?) |
| `line` | Divide por líneas |
| `size` | Divide por tamaño fijo con overlap |

### Tipo Chunk

```ts
type Chunk = {
  content: string;
  index: number;
  metadata: {
    filename?: string;
    section?: string;
  };
};
```

## Pipeline RAG completo

### 1. Endpoint `/api/embed` - Procesar archivo

```ts
app.post("/api/embed", async (req, res) => {
  const { content, filename, sessionId } = req.body;

  // 1. Crear chunks del contenido
  const chunks = chunkFile(content, filename, {
    maxChunkSize: 500,
    overlap: 50,
  });

  // 2. Generar embeddings para cada chunk
  const embeddedChunks = await embedChunks(chunks);

  // 3. Almacenar en memoria (por sessionId)
  storeEmbeddings(sessionId, embeddedChunks);

  res.json({ chunksCount: chunks.length });
});
```

### 2. Búsqueda semántica

```ts
export async function findSimilarChunks(
  sessionId: string,
  query: string,
  topK: number = 3
) {
  const storedChunks = getStoredChunks(sessionId);

  // Generar embedding de la query
  const { embedding: queryEmbedding } = await embed({
    model: embeddingModel,
    value: query,
  });

  // Calcular similitud con cada chunk
  const scored = storedChunks.map((chunk) => ({
    chunk,
    similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));

  // Retornar top K más similares
  return scored
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
}
```

### 3. Endpoint `/api/chat` - RAG

```ts
app.post("/api/chat", async (req, res) => {
  const { messages, sessionId } = req.body;

  // Buscar chunks relevantes para la pregunta
  const lastMessage = messages[messages.length - 1];
  const userQuery = lastMessage.parts?.find((p) => p.type === "text")?.text;

  const similar = await findSimilarChunks(sessionId, userQuery, 3);
  const contextChunks = similar.map(
    (s) => `[Similitud: ${(s.similarity * 100).toFixed(1)}%] ${s.chunk.content}`
  );

  // Pasar contexto a la función chat
  const result = chat(messages, contextChunks);
  result.pipeUIMessageStreamToResponse(res);
});
```

### 4. Inyección en system prompt

```ts
export const chat = (messages: UIMessage[], contextChunks: string[] = []) => {
  const system =
    contextChunks.length > 0
      ? `${baseSystem}\n\n## Contexto relevante:\n${contextChunks.join("\n\n")}`
      : baseSystem;

  return streamText({
    model,
    system,
    messages: convertToModelMessages(messages),
  });
};
```

## Interfaz del cliente

El cliente muestra los archivos procesados con su estado:

```tsx
type EmbeddedFile = {
  name: string;
  chunksCount: number;
  status: "loading" | "ready" | "error";
};

// Al subir archivo, enviar a /api/embed
const response = await fetch("/api/embed", {
  method: "POST",
  body: JSON.stringify({ content, filename, sessionId }),
});

// Al enviar mensaje, incluir sessionId
sendMessage({ text: input }, { body: { sessionId } });
```

## Estructura del proyecto

```
├── index.ts           # Función chat con RAG
├── server.ts          # API: /api/embed, /api/search, /api/chat
├── chunking.ts        # Utilidades para dividir texto
├── embeddings.ts      # embedMany, embed, cosineSimilarity
├── system.txt         # System prompt base
└── client/
    └── src/
        └── App.tsx    # UI con estado de archivos embebidos
```

## API Endpoints

```bash
# Crear embeddings de un archivo
POST /api/embed
{ "content": "...", "filename": "doc.txt", "sessionId": "uuid" }

# Buscar chunks similares (debug)
POST /api/search
{ "query": "precio del producto", "sessionId": "uuid", "topK": 3 }

# Chat con RAG
POST /api/chat
{ "messages": [...], "sessionId": "uuid" }
```

## Ejecución

```bash
npm install
cd client && npm install && cd ..
npm run dev
```

## Limitaciones actuales

- Almacenamiento en memoria (se pierde al reiniciar)
- Sin persistencia de embeddings
- Sin deduplicación de chunks

Para producción, considera usar una base de datos vectorial como:
- **Pinecone** - Managed vector DB
- **Supabase pgvector** - PostgreSQL con vectores
- **ChromaDB** - Open source, local

## Lo que aprenderás

1. **embedMany / embed** - Vectorizar texto con AI SDK
2. **cosineSimilarity** - Medir similitud semántica
3. **Chunking strategies** - Dividir documentos inteligentemente
4. **RAG pattern** - Retrieval Augmented Generation
5. **Session-based storage** - Aislar contexto por usuario

---

Que lo disfrutes. Abrazo. bliss
