import { useState, type FormEvent, useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Streamdown } from "streamdown";
import { useAutoScroll } from "./hooks/useAutoScroll";
import { useArtifacts } from "./hooks/useArtifacts";
import { ArtifactPanel } from "./components/ArtifactPanel";
import type { Artifact, ArtifactType } from "./types/artifacts";

declare global {
  interface Window {
    __SESSION_TOKEN__?: string;
  }
}

const transport = new DefaultChatTransport({
  api: "/api/chat",
  headers: () => ({
    "X-Session-Token": window.__SESSION_TOKEN__ || "",
  }),
});

// Extraer bloques de código de un texto markdown
function extractCodeBlocks(
  text: string,
  messageId: string
): Artifact[] {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const artifacts: Artifact[] = [];
  let match;
  let index = 0;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    const language = match[1] || "code";
    const code = match[2].trim();

    // Solo crear artefacto si el código tiene contenido significativo
    if (code.length > 10) {
      artifacts.push({
        id: `${messageId}-code-${index}`,
        type: "code" as ArtifactType,
        title: `${language.charAt(0).toUpperCase() + language.slice(1)} snippet`,
        content: code,
        language,
        messageId,
        createdAt: new Date(),
      });
      index++;
    }
  }

  return artifacts;
}

function Widget() {
  const [input, setInput] = useState("");
  const { messages, sendMessage } = useChat({ transport });
  const [containerRef, endRef] = useAutoScroll<HTMLElement>([messages]);
  const [showArtifacts, setShowArtifacts] = useState(false);
  const processedMessages = useRef<Set<string>>(new Set());

  const {
    selectedArtifact,
    autoSync,
    currentIndex,
    totalArtifacts,
    addArtifact,
    enableAutoSync,
    goToPrevious,
    goToNext,
  } = useArtifacts();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput("");
  };

  // Escuchar mensajes del host para control externo
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "chat-widget") {
        console.log("Widget received:", event.data);
      }
      // Escuchar cambios de estado del widget desde embed.ts
      if (event.data?.type === "widget-state-change") {
        // Si entra en modo expanded y hay artefactos, mostrar el panel
        if (event.data.state === "expanded" && totalArtifacts > 0) {
          setShowArtifacts(true);
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [totalArtifacts]);

  // Extraer artefactos de los mensajes
  useEffect(() => {
    messages.forEach((message) => {
      // Evitar procesar el mismo mensaje múltiples veces
      if (processedMessages.current.has(message.id)) return;

      // Solo procesar mensajes del asistente
      if (message.role !== "assistant") return;

      message.parts.forEach((part) => {
        // Detectar bloques de código en texto
        if (part.type === "text") {
          const codeArtifacts = extractCodeBlocks(part.text, message.id);
          codeArtifacts.forEach((artifact) => {
            addArtifact(artifact);
            // Auto-mostrar panel cuando llega el primer artefacto
            if (!showArtifacts && totalArtifacts === 0) {
              setShowArtifacts(true);
            }
          });
        }

        // Detectar tool-invocation de showArtifact
        if (part.type === "tool-invocation" && (part as any).toolName === "showArtifact") {
          const toolPart = part as any;
          // El resultado está en toolPart.result cuando state es "result"
          if (toolPart.state === "result" && toolPart.result) {
            const result = toolPart.result;
            addArtifact({
              id: `${message.id}-tool-${toolPart.toolCallId}`,
              type: result.type || "code",
              title: result.title || "Artefacto",
              content: result.content,
              language: result.language,
              messageId: message.id,
              createdAt: new Date(),
            });
            setShowArtifacts(true);
          }
        }

        // También detectar data-custom parts (Generative UI alternativa)
        if (part.type === "data-custom" || (part as any).artifact) {
          const artifactData = (part as any).data?.custom || (part as any).artifact || part;
          if (artifactData.type && artifactData.content) {
            addArtifact({
              id: `${message.id}-artifact-${Date.now()}`,
              type: artifactData.type,
              title: artifactData.title || "Artefacto",
              content: artifactData.content,
              language: artifactData.language,
              messageId: message.id,
              createdAt: new Date(),
            });
            setShowArtifacts(true);
          }
        }
      });

      processedMessages.current.add(message.id);
    });
  }, [messages, addArtifact, showArtifacts, totalArtifacts]);

  const handleCloseArtifacts = () => {
    setShowArtifacts(false);
  };

  const handleToggleArtifacts = () => {
    setShowArtifacts(!showArtifacts);
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Chat Panel - siempre visible */}
      <div
        className={`flex flex-col transition-all duration-300 ${
          showArtifacts ? "w-1/2" : "w-full"
        }`}
      >
        {/* Header */}
        <header className="p-4 bg-gray-900 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="font-semibold">Chat Asistente</h1>
                <p className="text-xs text-gray-300">Siempre disponible</p>
              </div>
            </div>

            {/* Botón de artefactos - siempre visible */}
            <button
              onClick={handleToggleArtifacts}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                showArtifacts
                  ? "bg-blue-500 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
              title={showArtifacts ? "Cerrar panel" : "Abrir panel de artefactos"}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
              {totalArtifacts > 0 && <span>{totalArtifacts}</span>}
            </button>
          </div>
        </header>

        {/* Messages */}
        <section
          ref={containerRef}
          className="flex-1 overflow-auto p-4 space-y-4"
        >
          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-8">
              <p>Hola! En qué puedo ayudarte?</p>
            </div>
          )}
          {messages.map((message) => {
            // Debug: log message structure
            console.log("Message:", message.id, message.role, message.parts?.map(p => p.type));

            return (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                    message.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {message.parts.map((part, idx) => {
                    // Debug detallado de cada parte
                    console.log("Part:", idx, part.type, JSON.stringify(part).slice(0, 200));

                    if (part.type === "text") {
                      return <Streamdown key={idx}>{part.text}</Streamdown>;
                    }

                    // Detectar tool-result por nombre (tool-showArtifact)
                    if (part.type.startsWith("tool-")) {
                      const toolName = part.type.replace("tool-", "");
                      const toolPart = part as any;

                      if (toolName === "showArtifact") {
                        return (
                          <div key={idx} className="text-sm">
                            <span className="text-green-600">✓</span> Código generado: <strong>{toolPart.result?.title || toolPart.title || "Artefacto"}</strong>
                            <br />
                            <button
                              onClick={() => setShowArtifacts(true)}
                              className="text-blue-500 hover:text-blue-700 text-xs underline cursor-pointer"
                            >
                              Ver en el panel derecho →
                            </button>
                          </div>
                        );
                      }

                      return (
                        <div key={idx} className="text-sm text-gray-500 italic">
                          ✓ {toolName}
                        </div>
                      );
                    }

                    // Fallback para tool-invocation clásico
                    if (part.type === "tool-invocation") {
                      const toolPart = part as any;
                      // Para showArtifact completado, mostrar mensaje informativo
                      if (toolPart.toolName === "showArtifact" && toolPart.state === "result") {
                        const result = toolPart.result;
                        return (
                          <div key={idx} className="text-sm">
                            <span className="text-green-600">✓</span> Código generado: <strong>{result?.title || "Artefacto"}</strong>
                            <br />
                            <span className="text-gray-500 text-xs">Ver en el panel derecho →</span>
                          </div>
                        );
                      }
                      return (
                        <div key={idx} className="text-sm text-gray-500 italic">
                          {toolPart.state === "result"
                            ? `✓ ${toolPart.toolName}`
                            : `⏳ ${toolPart.toolName}...`}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </section>

        {/* Input */}
        <footer className="p-4 border-t border-gray-200 bg-white">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.currentTarget.value)}
              type="text"
              placeholder="Escribe tu mensaje..."
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-blue-600 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </form>
        </footer>
      </div>

      {/* Artifact Panel - condicional */}
      {showArtifacts && (
        <div className="w-1/2 border-l border-gray-200 transition-all duration-300">
          <ArtifactPanel
            artifact={selectedArtifact ?? null}
            autoSync={autoSync}
            currentIndex={currentIndex}
            totalArtifacts={totalArtifacts}
            onClose={handleCloseArtifacts}
            onEnableAutoSync={enableAutoSync}
            onPrevious={goToPrevious}
            onNext={goToNext}
          />
        </div>
      )}
    </div>
  );
}

export default Widget;
