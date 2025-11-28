import { useState } from "react";
import { useChat } from "@ai-sdk/react";

export default function App() {
  const [input, setInput] = useState("");
  const { messages, sendMessage } = useChat();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput("");
  };

  return (
    <main
      style={{ maxWidth: 600, margin: "2rem auto", fontFamily: "system-ui" }}
    >
      <h1>Blissmo Chat con useChat</h1>

      <div style={{ marginBottom: "1rem" }}>
        {messages.map((m) => (
          <div key={m.id} style={{ marginBottom: "0.5rem" }}>
            <strong>{m.role}:</strong>{" "}
            {m.parts.map((part, i) =>
              part.type === "text" ? <span key={i}>{part.text}</span> : null
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu mensaje..."
          style={{ width: "100%", padding: "0.5rem" }}
        />
      </form>
    </main>
  );
}
