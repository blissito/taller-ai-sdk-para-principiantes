import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { chat } from "./index.js";
import { convertToModelMessages } from "ai";
const PORT = Number(process.env.PORT) || 3000;
const app = new Hono();
// API routes primero
app.post("/api/chat", async (c) => {
    const { messages } = await c.req.json();
    return chat(convertToModelMessages(messages)).toUIMessageStreamResponse();
});
// Servir estáticos del cliente compilado
app.use("/*", serveStatic({ root: "./client/dist" }));
// Fallback SPA: rutas no encontradas -> index.html
app.use("/*", serveStatic({ root: "./client/dist", path: "index.html" }));
serve({ fetch: app.fetch, port: PORT }, (info) => {
    console.info(`Running on port: ${info.port}`);
});
