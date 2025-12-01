export type Chunk = {
  content: string;
  index: number;
  metadata: {
    filename?: string;
    section?: string;
    startLine?: number;
    endLine?: number;
  };
};

export type ChunkingOptions = {
  maxChunkSize?: number;
  overlap?: number;
  splitBy?: "paragraph" | "sentence" | "line" | "size";
};

const DEFAULT_OPTIONS: Required<ChunkingOptions> = {
  maxChunkSize: 1000,
  overlap: 100,
  splitBy: "paragraph",
};

/**
 * Split text by paragraphs (double newlines)
 */
function splitByParagraph(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/**
 * Split text by sentences
 */
function splitBySentence(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Split text by lines
 */
function splitByLine(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

/**
 * Split text by fixed size with overlap
 */
function splitBySize(
  text: string,
  maxSize: number,
  overlap: number
): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + maxSize, text.length);
    chunks.push(text.slice(start, end));
    start = end - overlap;
    if (start + overlap >= text.length) break;
  }

  return chunks;
}

/**
 * Merge small chunks to reach target size
 */
function mergeChunks(
  pieces: string[],
  maxSize: number,
  overlap: number
): string[] {
  const merged: string[] = [];
  let current = "";

  for (const piece of pieces) {
    if (current.length + piece.length + 1 <= maxSize) {
      current = current ? `${current}\n\n${piece}` : piece;
    } else {
      if (current) merged.push(current);
      current = piece;
    }
  }

  if (current) merged.push(current);

  // Add overlap between chunks
  if (overlap > 0 && merged.length > 1) {
    return merged.map((chunk, i) => {
      if (i === 0) return chunk;
      const prevChunk = merged[i - 1];
      const overlapText = prevChunk.slice(-overlap);
      return `${overlapText}...${chunk}`;
    });
  }

  return merged;
}

/**
 * Main chunking function
 */
export function chunkText(
  text: string,
  options: ChunkingOptions = {}
): Chunk[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  let pieces: string[];

  switch (opts.splitBy) {
    case "paragraph":
      pieces = splitByParagraph(text);
      break;
    case "sentence":
      pieces = splitBySentence(text);
      break;
    case "line":
      pieces = splitByLine(text);
      break;
    case "size":
      pieces = splitBySize(text, opts.maxChunkSize, opts.overlap);
      break;
    default:
      pieces = splitByParagraph(text);
  }

  // Merge small pieces if not splitting by size
  const finalChunks =
    opts.splitBy === "size"
      ? pieces
      : mergeChunks(pieces, opts.maxChunkSize, opts.overlap);

  return finalChunks.map((content, index) => ({
    content,
    index,
    metadata: {},
  }));
}

/**
 * Chunk a file with metadata
 */
export function chunkFile(
  content: string,
  filename: string,
  options: ChunkingOptions = {}
): Chunk[] {
  const chunks = chunkText(content, options);

  return chunks.map((chunk) => ({
    ...chunk,
    metadata: {
      ...chunk.metadata,
      filename,
    },
  }));
}

/**
 * Format chunks for inclusion in a prompt
 */
export function formatChunksForPrompt(chunks: Chunk[]): string {
  return chunks
    .map(
      (chunk) =>
        `<chunk index="${chunk.index}"${chunk.metadata.filename ? ` file="${chunk.metadata.filename}"` : ""}>\n${chunk.content}\n</chunk>`
    )
    .join("\n\n");
}

/**
 * Select relevant chunks based on a simple keyword match
 * (In production, you'd use embeddings/vector search)
 */
export function selectRelevantChunks(
  chunks: Chunk[],
  query: string,
  maxChunks: number = 3
): Chunk[] {
  const queryWords = query.toLowerCase().split(/\s+/);

  const scored = chunks.map((chunk) => {
    const content = chunk.content.toLowerCase();
    const score = queryWords.reduce((acc, word) => {
      return acc + (content.includes(word) ? 1 : 0);
    }, 0);
    return { chunk, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, maxChunks)
    .map((s) => s.chunk);
}
