# Taller AI SDK para principiantes

Aprende a construir aplicaciones con IA usando el [Vercel AI SDK](https://ai-sdk.dev).

## Ejercicio

| Branch                       | Descripción     |
| ---------------------------- | --------------- |
| `ejercicio/02-react-usechat` | React + useChat |

## Descripción

En este ejercicio vamos a por fin conectar nuestro endpoint de chat con un componente React en el cliente. Quemoción. 😂

## Los componentes en el cliente

Necesitamos un chat, claro, un componente que renderice mensajes y un formulario para el input del usuario y todo lo demás que pondremos en App.ts:

```ts
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
```

Esta es una pequeña pieza dentro de todo este motor de conversaciones con robots, pero es una de las piezas más importántes. ⚙️
Estaremos mejorando el ternario para atrapar más que a `part.type === "text"`.

## La lógica de conexión con el hook: useChat

Para conseguir la comunicación cliente-servidor del chat, de la manera más simple y fluida posible, emplearemos al hook useChat que nos ofrece esta herramienta de Vercel. Su sintaxis es la siguiente:

```ts
const [input, setInput] = useState("");
const { messages, sendMessage } = useChat();

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (!input.trim()) return;
  sendMessage({ text: input });
  setInput("");
};
```

Usamos lo que el usuario escribe en el `input` y lo mandamos como `text` dentro de un objeto, que pasamos invocando `sendMessage`. 🕵🏻‍♂️ ¿Podría ser más simple?

## Defaults de servidor

Para conseguir la máxima simplificación aquí, he preferido crear el endpoint del api de la manera que el framework ya lo espera: `api/chat`

```ts
app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;
  const result = chat(messages);
  result.pipeUIMessageStreamToResponse(res);
});
```

La función chat, me permite separar mejor la lógica de agentes, agnostica a las rutas. 🤓

> 👀 `pipeUIMessageStreamToResponse` es la forma moderna, pero también el primer paso, pues en el futuro querremos escribir nuestros propios streams y sus deltas... 🫣 Espero seguir creciendo este taller con el tiempo y un ganchito, dice mi jefecita. 👵🏼

## Me resulta importante mencionar la transformación del repo para usar VITE ⚙️

Hicimos algunos cambios de arquitectura para poder tener un entorno full stack moderno usando express en el servidor y Vite compilando el build del cliente mientras lo sirve en un servidor secundario mientras se desarrolla el código. 👩🏻‍💻

### Primero, el archivo de configuración

Que vive dentro de una nueva carpeta llamada `client`.
Un archivo `vite.config.ts` es curiosamente fácil de leer.

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});
```

Se importa y se usa el plugin para `react()` dentro del array de plugins y también se agrega un proxy para que todas las peticiones a la ruta `/api` se apunten al puerto 3000. ✅

> 👀 Puedes inicializar un nuevo proyecto Vite dentro de `client` con el comando: `npm create vite@latest`.
