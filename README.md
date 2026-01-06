# Ejercicio 04: Contexto en pedacitos vectorizados

Ahora vamos a no solo tomar un archivo, sino varios; muchos archivos que formarán parte del contexto pero con un sistema de pedacitos implementado, esto es una búsqueda por similitud dentro de una base de datos. 🔎📊

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

## Para crear esta experiencia vamos a necesitar que el servidor crezca

Añadiremos 2 rutas nuevas al servidor:

```ts
"/api/embed" y "/api/search"
```

Con `api/embed` vamos a recibir el contenido de un archivo para hacerlo pedacitos y guardarlo con todo y vectores que usaremos para búsqueda semántica. Y, con `api/search` haremos la búsqueda semántica y conseguiremos solo los _chunks_ adecuados. ✅

## Las funciones del AI SDK que necesitamos

### embedMany

Genera embeddings para múltiples textos en una sola llamada. Así vectorizamos todos los pedacitos de un archivo de un jalón:

```ts
import { embedMany } from "ai";
import { openai } from "@ai-sdk/openai";

const embeddingModel = openai.embedding("text-embedding-3-small");

const { embeddings } = await embedMany({
  model: embeddingModel,
  values: ["texto 1", "texto 2", "texto 3"],
});

// embeddings es un array de vectores (number[][])
console.log(embeddings[0].length); // 1536 dimensiones 🤯
```

### embed

Genera embedding para un solo texto. Útil para la query del usuario:

```ts
import { embed } from "ai";

const { embedding } = await embed({
  model: embeddingModel,
  value: "¿Cuál es el precio del producto?",
});
```

### cosineSimilarity

Calcula la similitud entre dos vectores (0 = nada similar, 1 = idénticos). Esta es la magia de la búsqueda semántica. ✨

```ts
import { cosineSimilarity } from "ai";

const similarity = cosineSimilarity(vectorA, vectorB);
// 0.85 = muy similar
// 0.45 = algo relacionado
// 0.10 = poco relacionado
```

| Función            | Uso                         | Retorna                      |
| ------------------ | --------------------------- | ---------------------------- |
| `embedMany`        | Vectorizar múltiples textos | `{ embeddings: number[][] }` |
| `embed`            | Vectorizar un texto         | `{ embedding: number[] }`    |
| `cosineSimilarity` | Comparar dos vectores       | `number` (0 a 1)             |

## Chunking: Dividir texto en pedazos

Para poder pensar en cientos de archivos hay que pensar en miles de pedacitos. 🧱

El archivo `chunking.ts` implementa varias estrategias para dividir texto:

```ts
import { chunkText } from "./chunking";

const chunks = chunkText(contenido, {
  maxChunkSize: 500, // Máximo caracteres por chunk
  overlap: 50, // Solapamiento entre chunks
  splitBy: "paragraph", // Estrategia de división
});
```

| Estrategia  | Descripción                                |
| ----------- | ------------------------------------------ |
| `paragraph` | Divide por párrafos (doble salto de línea) |
| `sentence`  | Divide por oraciones (., !, ?)             |
| `line`      | Divide por líneas                          |
| `size`      | Divide por tamaño fijo con overlap         |

## En el cliente tenemos un par de funciones en App.tsx

Que nos sirven para mandar el archivo a `api/embed` cuando el usuario lo seleccione, para ser procesado y hasta actualizamos su estado cuando ya está listo:

```ts
const handleFileChange = useCallback(
  async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    for (const file of Array.from(e.target.files)) {
      // Agregar archivo con estado "loading"
      setEmbeddedFiles((prev) => [
        ...prev,
        { name: file.name, chunksCount: 0, status: "loading" },
      ]);

      const content = await readFileContent(file);

      // Enviar al backend para crear embeddings
      const response = await fetch("/api/embed", {
        method: "POST",
        body: JSON.stringify({ content, filename: file.name, sessionId }),
      });

      const { chunksCount } = await response.json();

      // Actualizar estado a "ready" con el número de chunks
      setEmbeddedFiles((prev) =>
        prev.map((f) =>
          f.name === file.name ? { ...f, chunksCount, status: "ready" } : f
        )
      );
    }
  },
  [sessionId]
);
```

## El endpoint /api/embed - Procesar archivo

Aquí es donde la magia sucede. Recibimos el archivo, lo hacemos pedacitos y generamos sus vectores:

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

## La búsqueda semántica

Cuando el usuario hace una pregunta, buscamos los chunks más relevantes:

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
  return scored.sort((a, b) => b.similarity - a.similarity).slice(0, topK);
}
```

## RAG: Inyectando el contexto

Finalmente, inyectamos los chunks relevantes en el system prompt. El modelo ahora tiene contexto específico para responder:

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

## Ejecución

```bash
npm install
cd client && npm install && cd ..
npm run dev
```

## Limitaciones actuales

Esta es una demostración pero que **no escala bien** para producción. 😗

- Almacenamiento en memoria (se pierde al reiniciar)
- Sin persistencia de embeddings
- Sin deduplicación de chunks

Para producción, considera usar una base de datos vectorial como:

- **Pinecone** - Managed vector DB
- **Supabase pgvector** - PostgreSQL con vectores
- **PostgreSQL + pgvector** - Self-hosted con extensión vectorial
- **MongoDB Atlas** - Vector search integrado
- **ChromaDB** - Open source, local

## Lo que aprenderás

1. **embedMany / embed** - Vectorizar texto con AI SDK
2. **cosineSimilarity** - Medir similitud semántica
3. **Chunking strategies** - Dividir documentos inteligentemente
4. **RAG pattern** - Retrieval Augmented Generation
5. **Session-based storage** - Aislar contexto por usuario

---

📺 **[Ver el curso completo en video](https://www.fixtergeek.com/cursos/ai-sdk/viewer)**

Que lo disfrutes. Abrazo. bliss 🦾
