# Bonus: Migración a Hono

Migramos el backend de Express.js a Hono para un servidor más moderno, ligero y compatible con múltiples runtimes (Node.js, Bun, Deno, Cloudflare Workers).

## Por qué Hono

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

## Cambios realizados

| Archivo        | Cambio                                                    |
| -------------- | --------------------------------------------------------- |
| `package.json` | Removido `express`, `@types/express`. Agregado `hono`, `@hono/node-server` |
| `server.ts`    | Reescrito con sintaxis Hono                               |

## Diferencias de sintaxis

| Express                                     | Hono                                        |
| ------------------------------------------- | ------------------------------------------- |
| `import express from "express"`             | `import { Hono } from "hono"`               |
| `const app = express()`                     | `const app = new Hono()`                    |
| `req.body`                                  | `await c.req.json()`                        |
| `res.json(data)`                            | `return c.json(data)`                       |
| `res.status(400).json()`                    | `return c.json(data, 400)`                  |
| `result.pipeUIMessageStreamToResponse(res)` | `return result.toUIMessageStreamResponse()` |
| `app.listen(PORT)`                          | `serve({ fetch: app.fetch, port })`         |

## Código del servidor

```ts
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { chat } from ".";

const PORT = Number(process.env.PORT) || 3000;
const app = new Hono();

// POST /api/embed
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
  return result.toUIMessageStreamResponse(); // ← Hono compatible
});

// Servir frontend estático
app.use("/*", serveStatic({ root: "./client/dist" }));

serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.info(`Running on port: ${info.port}`);
});
```

## Ventaja clave: toUIMessageStreamResponse()

Con Express necesitábamos:
```ts
result.pipeUIMessageStreamToResponse(res); // Muta el objeto res
```

Con Hono simplemente retornamos:
```ts
return result.toUIMessageStreamResponse(); // Retorna Response directamente
```

Esto es más funcional y compatible con el estándar Web Response API.

## Instalación de dependencias

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

Que lo disfrutes. Abrazo. bliss
