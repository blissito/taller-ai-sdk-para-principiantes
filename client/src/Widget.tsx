import { useState, type FormEvent, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Streamdown } from "streamdown";
import { useAutoScroll } from "./hooks/useAutoScroll";

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

function Widget() {
  const [input, setInput] = useState("");
  const { messages, sendMessage } = useChat({ transport });
  const [containerRef, endRef] = useAutoScroll<HTMLElement>([messages]);

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
        // Podemos recibir comandos del host si es necesario
        console.log("Widget received:", event.data);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="p-4 bg-gray-900 text-white shadow-lg">
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
      </header>

      {/* Messages */}
      <section
        ref={containerRef}
        className="flex-1 overflow-auto p-4 space-y-4"
      >
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-8">
            <p>¡Qué tal! ¿En qué puedo ayudarte?</p>
          </div>
        )}
        {messages.map((message) => (
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
              {message.parts.map((part, idx) =>
                part.type === "text" ? (
                  <Streamdown key={idx}>{part.text}</Streamdown>
                ) : null
              )}
            </div>
          </div>
        ))}
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
  );
}

export default Widget;
