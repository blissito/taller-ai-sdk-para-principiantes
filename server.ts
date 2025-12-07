import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { chat } from "./index.js";
import { convertToModelMessages } from "ai";
import { readFileSync } from "fs";
import { randomUUID } from "crypto";

const PORT = Number(process.env.PORT) || 3000;
const app = new Hono();

// Configuración de orígenes permitidos
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(",") || [];
const isDev = process.env.NODE_ENV !== "production";

// Tokens de sesión temporales (en producción usar Redis)
const sessionTokens = new Map<string, { origin: string; expires: number }>();

// Limpiar tokens expirados cada 10 minutos
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of sessionTokens) {
    if (data.expires < now) sessionTokens.delete(token);
  }
}, 600000);

// CORS para permitir requests desde cualquier origen (el token valida)
app.use("/api/*", cors({ origin: "*" }));

// API routes primero
app.post("/api/chat", async (c) => {
  const token = c.req.header("X-Session-Token");
  const session = sessionTokens.get(token || "");

  if (!session || session.expires < Date.now()) {
    return c.json({ error: "Sesión inválida o expirada" }, 401);
  }

  const { messages } = await c.req.json();
  return chat(convertToModelMessages(messages)).toUIMessageStreamResponse();
});

// Ruta del widget (iframe)
app.get("/widget", (c) => {
  const referer = c.req.header("Referer");
  let clientOrigin: string | null = null;

  if (referer) {
    try {
      clientOrigin = new URL(referer).origin;
    } catch {}
  }

  console.log(`[Widget] Referer: ${referer || "(vacío)"} -> Origin: ${clientOrigin}`);

  // Validar origen (en dev permitir localhost)
  const isAllowed =
    isDev ||
    (clientOrigin && ALLOWED_ORIGINS.includes(clientOrigin));

  if (!isAllowed) {
    console.log(`[Widget] BLOQUEADO - origen no autorizado: ${clientOrigin}`);
    return c.text("Origen no autorizado", 403);
  }

  // Generar token de sesión (expira en 2 horas)
  const token = randomUUID();
  sessionTokens.set(token, {
    origin: clientOrigin || "dev",
    expires: Date.now() + 7200000,
  });

  console.log(`[Widget] Token generado para: ${clientOrigin}`);

  // Inyectar token en el HTML
  let html = readFileSync("./client/dist/index-widget.html", "utf-8");
  html = html.replace(
    "</head>",
    `<script>window.__SESSION_TOKEN__="${token}";</script></head>`
  );

  return c.html(html);
});

// Servir estáticos del cliente compilado
app.use("/*", serveStatic({ root: "./client/dist" }));

// Fallback SPA: rutas no encontradas -> index.html
app.use("/*", serveStatic({ root: "./client/dist", path: "index.html" }));

serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.info(`Running on port: ${info.port}`);
});
