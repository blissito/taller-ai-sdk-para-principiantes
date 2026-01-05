# Ejercicio 02: React + useChat

Agregamos una interfaz React moderna usando el hook `useChat` del AI SDK. Configuramos Vite como bundler con proxy al servidor Express.

## Flujo de la aplicación

```
┌─────────────────────────────────────────────────────────┐
│                 CLIENTE (React + Vite)                  │
│                                                         │
│   useChat() → sendMessage() → fetch(/api/chat)          │
│                     ↓                                   │
│              messages.map() → UI                        │
└─────────────────────────────────────────────────────────┘
                          ↓
                  Proxy :5173 → :3000
                          ↓
┌─────────────────────────────────────────────────────────┐
│                 SERVIDOR (Express)                      │
│                                                         │
│   POST /api/chat → chat(messages) →                     │
│   pipeUIMessageStreamToResponse(res)                    │
└─────────────────────────────────────────────────────────┘
```

## Conceptos del AI SDK

### useChat

Hook de React para manejar conversaciones:

```tsx
import { useChat } from "@ai-sdk/react";

const { messages, sendMessage } = useChat();
```

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `messages` | `UIMessage[]` | Array de mensajes de la conversación |
| `sendMessage` | `function` | Envía un mensaje al servidor |

### Componente completo

```tsx
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
    <main>
      {/* Mensajes */}
      {messages.map((m) => (
        <div key={m.id}>
          <strong>{m.role}:</strong>
          {m.parts.map((part, i) =>
            part.type === "text" ? <span key={i}>{part.text}</span> : null
          )}
        </div>
      ))}

      {/* Input */}
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu mensaje..."
        />
      </form>
    </main>
  );
}
```

### Estructura de un mensaje

```ts
type UIMessage = {
  id: string;
  role: "user" | "assistant";
  parts: Array<{ type: "text"; text: string } | /* otros tipos */>;
};
```

### pipeUIMessageStreamToResponse

El servidor usa este método para streaming al cliente:

```ts
app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;
  const result = chat(messages);
  result.pipeUIMessageStreamToResponse(res); // ← Para useChat
});
```

| Método | Uso |
|--------|-----|
| `pipeTextStreamToResponse` | Texto plano (ejercicio 01) |
| `pipeUIMessageStreamToResponse` | UIMessage para useChat |

## Configuración Vite

### vite.config.ts

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:3000", // ← Proxy al servidor Express
    },
  },
});
```

### Scripts en package.json (raíz)

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:*\"",
    "dev:server": "tsx watch server.ts",
    "dev:client": "npm run dev --prefix client"
  }
}
```

## Estructura del proyecto

```
├── index.ts           # Función chat
├── server.ts          # Express API
├── package.json       # Scripts del servidor
└── client/
    ├── package.json   # Dependencias React
    ├── vite.config.ts # Configuración Vite
    └── src/
        └── App.tsx    # Componente principal
```

## Ejecución

```bash
# Instalar dependencias (servidor y cliente)
npm install
cd client && npm install && cd ..

# Ejecutar ambos servidores
npm run dev

# Abre http://localhost:5173
```

## Lo que aprenderás

1. **useChat** - Hook para conversaciones con IA
2. **sendMessage** - Enviar mensajes al servidor
3. **messages.parts** - Estructura de mensajes UI
4. **pipeUIMessageStreamToResponse** - Streaming para useChat
5. **Vite proxy** - Conectar frontend con backend

---

Que lo disfrutes. Abrazo. bliss
