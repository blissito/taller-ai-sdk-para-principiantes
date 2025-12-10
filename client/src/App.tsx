import { useState, useRef, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { Streamdown } from "streamdown";

type FileContext = {
  name: string;
  content: string;
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
  const [fileContexts, setFileContexts] = useState<FileContext[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { messages, sendMessage } = useChat();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && fileContexts.length === 0) return;

    // Build the message with file context
    const contextText =
      fileContexts.length > 0
        ? fileContexts
            .map((f) => `<context file="${f.name}">\n${f.content}\n</context>`)
            .join("\n\n")
        : "";

    const fullText = contextText ? `${contextText}\n\n---\n\n${input}` : input;

    console.log("=== DEBUG ===");
    console.log("fileContexts:", fileContexts.length, "archivos");
    console.log("contextText length:", contextText.length);
    console.log("fullText:", fullText.substring(0, 500) + "...");
    console.log("=============");
    sendMessage({ text: fullText }); // @reto ¿Necesitamos enviar el contexto en cada mensaje?
    setInput("");
    // Mantenemos fileContexts para que persista entre mensajes
  };

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return;

      const newContexts = await Promise.all(
        Array.from(e.target.files).map(async (file) => ({
          name: file.name,
          content: await readFileContent(file),
        }))
      );

      setFileContexts((prev) => [...prev, ...newContexts]);
      e.target.value = "";
    },
    []
  );

  const removeFile = (index: number) => {
    setFileContexts((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <main className="max-w-2xl mx-auto p-8 font-sans">
      <h1 className="text-2xl font-bold mb-6">Nuevo Curso: AI-SDK con React</h1>

      <section>
        {fileContexts.length > 0 && (
          <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-lg">
            {fileContexts.map((file, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm"
              >
                <span className="truncate max-w-[250px]">
                  <strong>En contexto: </strong>
                  {file.name}
                  <span className="text-gray-400 ml-1">
                    ({file.content.length} chars)
                  </span>
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

      <div className="space-y-4 mb-6">
        {messages.map((m) => (
          <div key={m.id}>
            <strong className="text-sm text-gray-600">{m.role}:</strong>
            {m.parts.map((part, i) => {
              if (part.type !== "text") return null;
              const displayText =
                m.role === "user" ? stripContextTags(part.text) : part.text; // Evitamos el system prompt
              if (!displayText) return null;
              return <Streamdown key={i}>{displayText}</Streamdown>;
            })}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
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
    </main>
  );
}
