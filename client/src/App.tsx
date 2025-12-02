import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { Streamdown } from "streamdown";
import { cn } from "./lib/utils";
import { CursoCard } from "./components/CursoCard";
import type { Curso } from "./data/cursos";

type EmbeddedFile = {
  name: string;
  chunksCount: number;
  status: "loading" | "ready" | "error";
};

function PaperclipIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function WrenchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

async function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

/**
 * Remove context tags from message text for display
 */
function stripContextTags(text: string): string {
  // Remove all <context>...</context> blocks
  let cleaned = text.replace(/<context[^>]*>[\s\S]*?<\/context>/g, "");
  // Remove separator and everything before it
  const separatorIndex = cleaned.indexOf("---");
  if (separatorIndex !== -1) {
    cleaned = cleaned.substring(separatorIndex + 3);
  }
  return cleaned.trim();
}

export default function App() {
  const [input, setInput] = useState("");
  const [embeddedFiles, setEmbeddedFiles] = useState<EmbeddedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generar sessionId único para esta sesión
  const sessionId = useMemo(() => crypto.randomUUID(), []);

  const { messages, sendMessage } = useChat();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    console.log("=== DEBUG ===");
    console.log("sessionId:", sessionId);
    console.log("embeddedFiles:", embeddedFiles.length, "archivos");
    console.log("input:", input);
    console.log("=============");

    sendMessage({ text: input }, { body: { sessionId } });
    setInput("");
  };

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return;

      for (const file of Array.from(e.target.files)) {
        // Agregar archivo con estado "loading"
        setEmbeddedFiles((prev) => [
          ...prev,
          { name: file.name, chunksCount: 0, status: "loading" },
        ]);

        try {
          const content = await readFileContent(file);

          // Enviar al backend para crear embeddings
          const response = await fetch("/api/embed", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content,
              filename: file.name,
              sessionId,
            }),
          });

          const data = await response.json();

          if (response.ok) {
            // Actualizar estado a "ready"
            setEmbeddedFiles((prev) =>
              prev.map((f) =>
                f.name === file.name
                  ? { ...f, chunksCount: data.chunksCount, status: "ready" }
                  : f
              )
            );
            console.log(`Embeddings creados: ${data.chunksCount} chunks`);
          } else {
            throw new Error(data.error);
          }
        } catch (error) {
          console.error("Error creando embeddings:", error);
          setEmbeddedFiles((prev) =>
            prev.map((f) =>
              f.name === file.name ? { ...f, status: "error" } : f
            )
          );
        }
      }

      e.target.value = "";
    },
    [sessionId]
  );

  const removeFile = (index: number) => {
    setEmbeddedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <article className="max-w-4xl mx-auto p-8 font-sans">
      <h1 className="text-2xl font-bold mb-2">Fixter Assistant</h1>
      <p className="text-gray-600 mb-6">
        Pregúntame sobre nuestros cursos de desarrollo
      </p>

      <section>
        {embeddedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-lg mb-4">
            {embeddedFiles.map((file, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 px-3 py-1.5 border rounded-full text-sm ${
                  file.status === "loading"
                    ? "bg-yellow-50 border-yellow-200"
                    : file.status === "error"
                    ? "bg-red-50 border-red-200"
                    : "bg-green-50 border-green-200"
                }`}
              >
                <span className="truncate max-w-[250px]">
                  {file.status === "loading" && "Procesando... "}
                  {file.status === "error" && "Error: "}
                  {file.status === "ready" && "Embeddings: "}
                  {file.name}
                  {file.status === "ready" && (
                    <span className="text-gray-500 ml-1">
                      ({file.chunksCount} chunks)
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XIcon />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <main
        className="space-y-4 min-h-[70vh] max-h-[70vh] overflow-auto pb-4"
        style={{ scrollbarWidth: undefined }}
      >
        {messages.map((m) => (
          <div key={m.id}>
            <strong className="text-sm text-gray-800">{m.role}:</strong>
            {m.parts.map((part, i) => {
              // Texto normal
              if (part.type === "text") {
                const displayText =
                  m.role === "user" ? stripContextTags(part.text) : part.text;
                if (!displayText) return null;
                return <Streamdown key={i}>{displayText}</Streamdown>;
              }

              // Tool Badge component
              const ToolBadge = ({ name, loading }: { name: string; loading?: boolean }) => (
                <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium mb-2 ${
                  loading
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-blue-100 text-blue-700"
                }`}>
                  <WrenchIcon className={loading ? "animate-spin" : ""} />
                  <span>{name}</span>
                  {loading && <span className="animate-pulse">...</span>}
                </div>
              );

              // AI SDK 5.0: tool-${toolName} con estados output-available/input-available
              // showCourse - mostrar card de curso
              if (part.type === "tool-showCourse") {
                if (part.state === "output-available" && part.output) {
                  const curso = part.output as Curso;
                  return (
                    <div key={i} className="my-2">
                      <ToolBadge name="showCourse" />
                      <div className="max-w-sm">
                        <CursoCard curso={curso} />
                      </div>
                    </div>
                  );
                }
                if (part.state === "input-available") {
                  return (
                    <div key={i} className="my-2">
                      <ToolBadge name="showCourse" loading />
                    </div>
                  );
                }
              }

              // searchContext - mostrar resultados de búsqueda
              if (part.type === "tool-searchContext") {
                if (part.state === "output-available" && part.output) {
                  return (
                    <div key={i} className="my-2">
                      <ToolBadge name="searchContext" />
                    </div>
                  );
                }
                if (part.state === "input-available") {
                  return (
                    <div key={i} className="my-2">
                      <ToolBadge name="searchContext" loading />
                    </div>
                  );
                }
              }

              return null;
            })}
          </div>
        ))}
        <div ref={scrollRef} />
      </main>

      <form
        onSubmit={handleSubmit}
        className={cn("space-y-3 flex flex-col justify-end ", {
          "bg-white p-4 border border-gray-200 rounded-2xl relative -top-4":
            true,
        })}
      >
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            multiple
            accept="text/plain,text/markdown,.txt,.md,.pdf,application/pdf,image/*"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-gray-500 hover:text-blue-500 hover:bg-gray-100 rounded-lg transition-colors"
            title="Adjuntar archivo"
          >
            <PaperclipIcon />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu mensaje..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </form>
    </article>
  );
}
