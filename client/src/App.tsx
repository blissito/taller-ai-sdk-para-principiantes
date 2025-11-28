import { useChat } from "@ai-sdk/react";

export default function App() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/chat",
  });

  return (
    <main style={{ maxWidth: 600, margin: "2rem auto", fontFamily: "system-ui" }}>
      <h1>Chat con useChat</h1>

      <div style={{ marginBottom: "1rem" }}>
        {messages.map((m) => (
          <div key={m.id} style={{ marginBottom: "0.5rem" }}>
            <strong>{m.role}:</strong> {m.content}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Escribe tu mensaje..."
          style={{ width: "100%", padding: "0.5rem" }}
        />
      </form>
    </main>
  );
}
