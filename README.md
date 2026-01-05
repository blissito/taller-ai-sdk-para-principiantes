# Ejercicio 02: Añadiendo un SPA con React

En este ejercicio vamos a sustituir nuestra interfaz anterior de chat por un componente React del cliente. Quemoción. 😂

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

## Componentes del cliente

Necesitamos un chat, claro, un componente que renderice mensajes y un formulario para el input del usuario y todo lo demás que podemos observar en `App.tsx`.

```tsx
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

Esta es una pequeña pieza dentro de todo este motor de conversaciones con robots. 🤖
Pero, es una de las piezas más importantes. 🏴‍☠️

> 👀 Estaremos mejorando el ternario para atrapar más que solo `part.type === "text"` en el ejercicio de la branch [`ejercicio/05-tools`](https://github.com/blissito/taller-ai-sdk-para-principiantes/blob/ejercicio/05-tools/client/src/App.tsx#L260).

## ¿Cómo se emplea useChat?

Para conseguir la comunicación cliente-servidor del chat, de la manera más simple y fluida posible, emplearemos al _hook_ `useChat`, que nos ofrece el ai-sdk de Vercel.
Esta es la sintaxis:

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

Usamos el texto que el usuario escribió en el `input`, lo limpiamos dejando solo un espacio simple entre palabras y lo colocamos como valor de una llave `text` dentro de un objeto que le pasamos a `sendMessage`. 🔥 Luego, reseteamos el _input_.

Díme, ¿podría ser más simple? 🤷🏻‍♂️

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `messages` | `UIMessage[]` | Array de mensajes de la conversación |
| `sendMessage` | `function` | Envía un mensaje al servidor |

## Ahora el endpoint del server

Para conseguir la máxima simplificación aquí, he preferido crear el endpoint del api de la manera que el _framework_ ya lo espera: `/api/chat`.

```ts
app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;
  const result = chat(messages);
  result.pipeUIMessageStreamToResponse(res);
});
```

> 👀 Para poder usar `body` como un objeto y poder deconstruir `messages`, es necesario tener el _middleware_ `express.json` instalado: `app.use(express.json());` 🤓

> 💬 `pipeUIMessageStreamToResponse` es la forma moderna, pero también el primer paso, pues en el futuro querremos escribir nuestros propios _streams_ y sus deltas... 🫣 Espero seguir creciendo este taller; con el tiempo y un ganchito, dice mi jefecita. 👵🏼

| Método | Uso |
|--------|-----|
| `pipeTextStreamToResponse` | Texto plano (ejercicio 01) |
| `pipeUIMessageStreamToResponse` | UIMessage para useChat |

En este punto, me resulta importante mostrarte cómo se transformó el repo para usar Vite. 🤓

## Instalando y configurando Vite ⚙️

Hicimos algunos cambios de arquitectura para poder tener un entorno _full stack_ moderno: usando express en el servidor y Vite para compilar el _build_ del cliente, mientras que también lo usamos para levantar un servidor secundario de desarrollo y poder ver los cambios en la interfaz en tiempo real. ⚡️👩🏻‍💻

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

Se importa y se usa el plugin para `react()` dentro del array de plugins y también se agrega un _proxy_ para que todas las peticiones a la ruta `/api` se apunten al puerto `3000`, es decir: nuestro servidor express. ✅

> 👀 Siempre puedes inicializar un nuevo proyecto Vite dentro de la carpeta `client` con el comando: `npm create vite@latest`.

### Ahora, observemos un poco los package.json

Tenemos dos archivos `package.json`, uno para cada lado de nuestra app full stack: client/servidor.
En el archivo del servidor encontraremos tres scripts: `dev`, `dev:server` y `dev:client`.

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:*\"",
    "dev:server": "tsx watch server.ts",
    "dev:client": "npm run dev --prefix client"
  }
}
```

Como te imaginarás, `dev:server` usa `tsx` con _watch_ para que nuestro servidor API esté disponible en el puerto `3000`, mientras que `dev:client` hace uso de npm, enviando el comando a la carpeta `client` usando la flag `--prefix`. ✅

Confirmemos esto, mirando el archivo `package.json` dentro de la carpeta `client`.

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  }
}
```

Encontraremos que el _script_ `dev` que ejecutará _concurrently_ es simplemente `vite`. 🤯
También encontraremos las instalaciones del app del cliente. 🛍️

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

## Ponerlo bonito se te queda de tarea

Ahora que tienes tu propio asistente IA es momento de que le pongas $5 pesitos de diseño y propongas la interfaz más kawaii posible. 🍡🤭

## Lo que aprenderás

1. **useChat** - Hook para conversaciones con IA
2. **sendMessage** - Enviar mensajes al servidor
3. **messages.parts** - Estructura de mensajes UI
4. **pipeUIMessageStreamToResponse** - Streaming para useChat
5. **Vite proxy** - Conectar frontend con backend

---

📺 **[Ver el curso completo en video](https://www.fixtergeek.com/cursos/ai-sdk/viewer)**

Abrazo. bliss. 🤓
