# Ejercicio 01: Streaming con Vanilla JS

Creamos un servidor Express que expone un endpoint de chat y consumimos el stream desde el navegador usando JavaScript puro (sin frameworks).

## Flujo de la aplicación

```
┌─────────────────────────────────────────────────────────┐
│                      SERVIDOR                           │
│   Express + pipeTextStreamToResponse                    │
└─────────────────────────────────────────────────────────┘
                          ↓
                    GET /api/chat
                          ↓
              Stream de bytes (chunks)
                          ↓
┌─────────────────────────────────────────────────────────┐
│                      CLIENTE                            │
│   fetch → reader.read() → TextDecoder → DOM             │
└─────────────────────────────────────────────────────────┘
```

## Conceptos del AI SDK

### pipeTextStreamToResponse

Envía el stream de texto directamente al Response de Express:

```ts
import express from "express";
import { chat } from ".";

const app = express();

app.get("/api/chat", async (_, res) => {
  const result = chat("crea un poema sobre robots");
  result.pipeTextStreamToResponse(res); // ← Pipe directo
});
```

| Método | Framework | Descripción |
|--------|-----------|-------------|
| `pipeTextStreamToResponse(res)` | Express | Pipe a response de Express |
| `toTextStreamResponse()` | Hono/Web | Retorna Response estándar |

## Cliente: Consumiendo el stream

### Paso 1: Hacer fetch y obtener el reader

```js
const response = await fetch("/api/chat");
const reader = response.body.getReader();
```

`response.body` es un `ReadableStream<Uint8Array>`. Usamos `.getReader()` para leerlo chunk por chunk.

### Paso 2: Decodificar y mostrar

```js
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  output.textContent += decoder.decode(value);
}
```

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `done` | `boolean` | `true` cuando el stream termina |
| `value` | `Uint8Array` | Bytes del chunk actual |

### Código completo del cliente

```js
// public/client.js
const output = document.getElementById("output");
const button = document.getElementById("start");

async function startStream() {
  output.textContent = "";
  const response = await fetch("/api/chat");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    output.textContent += decoder.decode(value);
  }
}

button.addEventListener("click", startStream);
```

## Servidor Express

```ts
// server.ts
import express from "express";
import { chat } from ".";

const app = express();

// Servir archivos estáticos desde /public
app.use(express.static("public"));

// Endpoint de chat con streaming
app.get("/api/chat", async (_, res) => {
  const result = chat("crea un poema sobre robots");
  result.pipeTextStreamToResponse(res);
});

app.listen(3000);
```

## Estructura del proyecto

```
├── index.ts       # Función chat con streamText
├── server.ts      # Servidor Express
└── public/
    ├── index.html # Página con botón y output
    └── client.js  # Lógica de streaming
```

## Ejecución

```bash
npm install
npm run dev
# Abre http://localhost:3000
```

## Limitaciones

- El prompt está hardcodeado en el servidor
- No hay input del usuario
- No hay historial de conversación

En el siguiente ejercicio agregaremos React + useChat para una experiencia de chat completa.

## Lo que aprenderás

1. **pipeTextStreamToResponse** - Streaming con Express
2. **ReadableStream** - API nativa del navegador
3. **TextDecoder** - Convertir bytes a texto
4. **reader.read()** - Consumir stream chunk por chunk
5. **express.static** - Servir archivos estáticos

---

Que lo disfrutes. Abrazo. bliss
