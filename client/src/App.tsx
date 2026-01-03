import { useChat } from "@ai-sdk/react";
import { useMemo, useRef, useEffect, useState, useCallback } from "react";
import { Streamdown } from "streamdown";
import {
  SandpackProvider,
  SandpackCodeEditor,
  SandpackConsole,
  SandpackPreview,
} from "@codesandbox/sandpack-react";

// Componente Sandpack completo con layout profesional
function CodeArtifact({
  code,
  title,
  topic,
}: {
  code: string;
  title: string;
  topic?: string;
}) {
  const [activeTab, setActiveTab] = useState<"console" | "preview">("console");

  return (
    <SandpackProvider
      key={code}
      template="vanilla-ts"
      theme={{
        colors: {
          surface1: "#0f172a", // slate-900
          surface2: "#1e293b", // slate-800
          surface3: "#334155", // slate-700
          clickable: "#94a3b8", // slate-400
          base: "#e2e8f0", // slate-200
          disabled: "#475569", // slate-600
          hover: "#f1f5f9", // slate-100
          accent: "#22d3ee", // cyan-400
          error: "#f87171", // red-400
          errorSurface: "#7f1d1d", // red-900
        },
        syntax: {
          plain: "#e2e8f0",
          comment: { color: "#64748b", fontStyle: "italic" },
          keyword: "#c084fc", // purple-400
          tag: "#22d3ee", // cyan-400
          punctuation: "#94a3b8",
          definition: "#4ade80", // green-400
          property: "#60a5fa", // blue-400
          static: "#fbbf24", // amber-400
          string: "#a5f3fc", // cyan-200
        },
        font: {
          body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          mono: '"Fira Code", "JetBrains Mono", Menlo, Monaco, monospace',
          size: "13px",
          lineHeight: "1.6",
        },
      }}
      files={{
        "/index.ts": {
          code: code,
          active: true,
        },
      }}
      options={{
        autorun: true,
        autoReload: true,
        recompileMode: "delayed",
        recompileDelay: 500,
        initMode: "immediate",
      }}
    >
      <div className="h-full flex flex-col bg-slate-900 rounded-lg overflow-hidden border border-slate-700/50">
        {/* Header con título y controles */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800/80 border-b border-slate-700">
          <div className="flex items-center gap-3">
            {/* Dots decorativos estilo macOS */}
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <span className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-cyan-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
                {title}
              </h3>
              {topic && <span className="text-xs text-slate-400">{topic}</span>}
            </div>
          </div>
          <SandpackControls />
        </div>

        {/* Editor de código */}
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex-1 min-h-0 overflow-hidden">
            <SandpackCodeEditor
              showLineNumbers
              showInlineErrors
              wrapContent
              showTabs={false}
              style={{
                height: "100%",
                fontSize: "13px",
              }}
            />
          </div>

          {/* Tabs y Output */}
          <div className="h-[200px] flex flex-col border-t border-slate-700">
            <SandpackTabs activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="flex-1 overflow-hidden relative">
              {/* Preview SIEMPRE montado para que el bundler funcione */}
              <div
                className={
                  activeTab === "preview"
                    ? "h-full"
                    : "absolute inset-0 opacity-0 pointer-events-none"
                }
              >
                <SandpackPreview
                  style={{ height: "100%" }}
                  showNavigator={false}
                  showOpenInCodeSandbox={false}
                  showRefreshButton={false}
                />
              </div>
              {/* Console visible cuando está activo */}
              <div className={activeTab === "console" ? "h-full" : "hidden"}>
                <SandpackConsole
                  style={{ height: "100%" }}
                  showHeader={false}
                  showResetConsoleButton
                  resetOnPreviewRestart
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </SandpackProvider>
  );
}

function App() {
  const { messages, sendMessage, status } = useChat();
  const [input, setInput] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll automático al final de los mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Extraer el código del artifact desde los mensajes
  const codeArtifact = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      if (message.role === "assistant") {
        const customPart = message.parts?.find(
          (part) => part.type === "data-custom"
        );
        if (customPart && customPart.type === "data-custom") {
          const data = customPart.data as {
            type: string;
            topic: string;
            title: string;
            code: string;
          };
          if (data.type === "code") {
            return data;
          }
        }
      }
    }
    return null;
  }, [messages]);

  const isLoading = status === "streaming" || status === "submitted";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  };

  return (
    <article className="min-h-svh bg-gradient-to-br from-blue-950 via-indigo-900 to-slate-900 text-white flex flex-col">
      {/* Header */}
      <header className="p-4 text-center border-b border-white/10">
        <h1 className="text-3xl font-bold mb-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
          TypeScript Tutor
        </h1>
        <p className="text-gray-400 text-sm">
          Aprende TypeScript con ejemplos ejecutables - AI SDK 6 + Sandpack
        </p>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Sandpack Panel - Código ejecutable */}
        <section className="w-1/2 border-r border-white/10 flex flex-col">
          <div className="p-3 border-b border-white/10 bg-white/5">
            <h2 className="font-semibold text-cyan-400 flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {codeArtifact?.title || "Sandbox"}
            </h2>
            {codeArtifact?.topic && (
              <span className="text-xs text-gray-500">
                Tema: {codeArtifact.topic}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-hidden p-2">
            {codeArtifact ? (
              <CodeArtifact
                code={codeArtifact.code}
                title={codeArtifact.title}
                topic={codeArtifact.topic}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 bg-slate-900/80 rounded-lg border border-slate-700/50">
                <div className="text-center p-8">
                  {/* Terminal icon */}
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-slate-700/50">
                    <svg
                      className="w-10 h-10 text-cyan-400/60"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-lg font-medium text-gray-300 mb-2">
                    Sandbox TypeScript
                  </p>
                  <p className="text-sm text-gray-500 max-w-xs mx-auto">
                    Pregunta sobre types, functions, interfaces y el código
                    aparecerá aquí listo para ejecutar
                  </p>
                  <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-3.5 h-3.5 text-emerald-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                      Auto-run
                    </span>
                    <span className="text-slate-600">•</span>
                    <span>Editable</span>
                    <span className="text-slate-600">•</span>
                    <span>Console + Preview</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Chat Panel */}
        <section className="w-1/2 flex flex-col">
          <div className="p-3 border-b border-white/10 bg-white/5">
            <h2 className="font-semibold text-purple-400 flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              Chat
            </h2>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <p className="text-lg mb-4">Hola! Soy tu tutor de TypeScript</p>
                <div className="space-y-2 text-sm">
                  <button
                    onClick={() =>
                      sendMessage({ text: "Explícame los tipos básicos" })
                    }
                    className="bg-white/5 rounded-lg p-3 block w-full text-left hover:bg-white/10 transition-colors"
                  >
                    Explícame los tipos básicos
                  </button>
                  <button
                    onClick={() =>
                      sendMessage({ text: "Cómo funcionan las interfaces?" })
                    }
                    className="bg-white/5 rounded-lg p-3 block w-full text-left hover:bg-white/10 transition-colors"
                  >
                    Cómo funcionan las interfaces?
                  </button>
                  <button
                    onClick={() =>
                      sendMessage({ text: "Muéstrame un ejemplo de generics" })
                    }
                    className="bg-white/5 rounded-lg p-3 block w-full text-left hover:bg-white/10 transition-colors"
                  >
                    Muéstrame un ejemplo de generics
                  </button>
                </div>
              </div>
            )}

            {messages.map((message) => {
              // Extraer el texto del mensaje (ignorar data-custom)
              const textParts = message.parts?.filter(
                (part) => part.type === "text"
              );
              const text =
                textParts
                  ?.map((p) => (p.type === "text" ? p.text : ""))
                  .join("") || "";

              if (!text && message.role === "assistant") return null;

              return (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-white/10 text-gray-200"
                    }`}
                  >
                    {message.role === "user" ? (
                      <p className="whitespace-pre-wrap">{text}</p>
                    ) : (
                      <Streamdown mode="streaming">{text}</Streamdown>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/10 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="p-4 border-t border-white/10"
          >
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pregunta sobre TypeScript..."
                className="flex-1 bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                ) : (
                  "Enviar"
                )}
              </button>
            </div>
          </form>
        </section>
      </main>

      {/* Footer */}
      <footer className="p-2 text-center text-gray-500 text-xs border-t border-white/10">
        <p>
          AI SDK 6 ToolLoopAgent +{" "}
          <a
            href="https://sandpack.codesandbox.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-500 hover:underline"
          >
            Sandpack
          </a>
        </p>
      </footer>
    </article>
  );
}

export default App;
