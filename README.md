# Bonus: Migración a Hono

Express ha sido el rey de los frameworks de Node.js por años. Pero hay un nuevo contendiente: **Hono**. 🔥

Hono es más ligero, más rápido, y lo mejor: está diseñado para funcionar en cualquier runtime (Node.js, Bun, Deno, Cloudflare Workers). En este ejercicio migramos nuestro servidor de Express a Hono.

## ¿Por qué Hono?

```
┌─────────────────────────────────────────────────────────┐
│                      Hono vs Express                    │
├─────────────────────┬───────────────────────────────────┤
│  Tamaño             │  ~14KB vs ~200KB+                 │
│  Performance        │  Más rápido (benchmarks)          │
│  TypeScript         │  First-class support              │
│  Runtimes           │  Node, Bun, Deno, Workers, Edge   │
│  API Response       │  Retorna Response, no muta res    │
│  Patrones           │  Más funcional, menos OOP         │
└─────────────────────┴───────────────────────────────────┘
```

La diferencia más notable: en Express mutamos el objeto `res`, en Hono simplemente **retornamos** un `Response`. Es más funcional y compatible con el estándar Web. 👌

## La migración es casi directa

Si ya conoces Express, Hono te parecerá familiar:

| Express | Hono |
|---------|------|
| `import express from "express"` | `import { Hono } from "hono"` |
| `const app = express()` | `const app = new Hono()` |
| `req.body` | `await c.req.json()` |
| `res.json(data)` | `return c.json(data)` |
| `res.status(400).json()` | `return c.json(data, 400)` |
| `app.listen(PORT)` | `serve({ fetch: app.fetch, port })` |

La sintaxis es casi idéntica, solo que todo es async y retornamos valores en lugar de mutar.

## El servidor migrado

```ts
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { chat } from ".";

const PORT = Number(process.env.PORT) || 3000;
const app = new Hono();

// POST /api/embed - Crear embeddings
app.post("/api/embed", async (c) => {
  const { content, filename, sessionId } = await c.req.json();

  if (!content || !sessionId) {
    return c.json({ error: "content y sessionId son requeridos" }, 400);
  }

  // ... lógica de embeddings
  return c.json({ success: true, chunksCount: chunks.length });
});

// POST /api/chat - Streaming con AI SDK
app.post("/api/chat", async (c) => {
  const { messages, sessionId } = await c.req.json();
  const result = chat(messages, sessionId);
  return result.toUIMessageStreamResponse(); // ← La magia
});

// Servir frontend estático
app.use("/*", serveStatic({ root: "./client/dist" }));

serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.info(`Running on port: ${info.port}`);
});
```

## La ventaja clave: toUIMessageStreamResponse()

Con Express necesitábamos "pipear" el stream al response:
```ts
result.pipeUIMessageStreamToResponse(res); // Muta el objeto res
```

Con Hono simplemente retornamos:
```ts
return result.toUIMessageStreamResponse(); // Retorna Response directamente
```

Esto es más limpio, más funcional, y compatible con el estándar Web Response API. El AI SDK sabe cómo trabajar con ambos. 🤝

## El objeto Context (c)

En Hono, cada handler recibe un objeto `c` (context) que tiene todo lo que necesitas:

```ts
app.post("/api/chat", async (c) => {
  const body = await c.req.json();    // Leer body
  const header = c.req.header("x-custom"); // Leer headers

  return c.json({ data });  // Responder JSON
  return c.text("ok");      // Responder texto
  return c.html("<h1>Hi</h1>"); // Responder HTML
});
```

## Instalación

```bash
# Quitar Express
npm uninstall express @types/express

# Agregar Hono
npm install hono @hono/node-server
```

## Estructura del proyecto

```
├── index.ts           # Lógica de chat (sin cambios)
├── server.ts          # Servidor Hono (migrado)
├── chunking.ts        # Utilidades (sin cambios)
├── embeddings.ts      # Embeddings (sin cambios)
└── client/
    └── dist/          # Build del frontend (servido estáticamente)
```

La lógica de negocio no cambia. Solo cambia cómo exponemos los endpoints. 📦

## Ejecución

```bash
npm install
cd client && npm install && npm run build && cd ..
npm run dev
```

> El cliente se sirve desde `client/dist` con `serveStatic`.

## Lo que aprenderás

1. **Hono basics** - Sintaxis moderna de servidor web
2. **Context object (c)** - `c.req.json()`, `c.json()`
3. **serveStatic** - Servir archivos estáticos
4. **toUIMessageStreamResponse()** - Integración AI SDK + Hono
5. **Multi-runtime** - Código portable entre Node/Bun/Deno

---

Que lo disfrutes. Abrazo. bliss 🦾
