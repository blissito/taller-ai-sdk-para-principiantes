# Migración a Hono

Se migró el backend de Express.js a Hono para un servidor más ligero y consolidado.

**Cambios realizados:**

| Archivo        | Cambio                                                                     |
| -------------- | -------------------------------------------------------------------------- |
| `package.json` | Removido `express`, `@types/express`. Agregado `hono`, `@hono/node-server` |
| `server.ts`    | Reescrito con sintaxis Hono                                                |

**Diferencias de sintaxis:**

| Express                                     | Hono                                        |
| ------------------------------------------- | ------------------------------------------- |
| `import express from "express"`             | `import { Hono } from "hono"`               |
| `const app = express()`                     | `const app = new Hono()`                    |
| `req.body`                                  | `await c.req.json()`                        |
| `res.json(data)`                            | `return c.json(data)`                       |
| `res.status(400).json()`                    | `return c.json(data, 400)`                  |
| `result.pipeUIMessageStreamToResponse(res)` | `return result.toUIMessageStreamResponse()` |
| `app.listen(PORT)`                          | `serve({ fetch: app.fetch, port })`         |

El servidor ahora también sirve archivos estáticos del frontend (`client/dist`) usando `serveStatic`.
