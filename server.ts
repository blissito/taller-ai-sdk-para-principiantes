import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { basicAuth } from "hono/basic-auth";
import { chat } from "./index.js";
import { convertToModelMessages } from "ai";
import { readFileSync } from "fs";
import { randomUUID } from "crypto";
import { adminDashboardHTML } from "./admin.js";
import {
  initDb,
  createSession,
  getSession,
  deleteExpiredSessions,
  getActiveSessions,
  saveChatMessage,
  getChatHistory,
  getMessageStats,
  getMessagesByDay,
  getMessagesByOrigin,
  saveUsageLog,
  getUsageStats,
  getUsageByDay,
  getUsageByOrigin,
  isPublicAccess,
  getAllowedOriginsFromDb,
  setConfig,
  getAllConfig,
} from "./db/index.js";

// Inicializar base de datos
initDb();

const PORT = Number(process.env.PORT) || 3000;
const app = new Hono();

// Configuración de orígenes permitidos (combina env vars + DB)
const ENV_ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(",").filter(Boolean) || [];
const isDev = process.env.NODE_ENV !== "production";

// Obtiene todos los orígenes permitidos (env + DB)
function getAllowedOrigins(): string[] {
  const dbOrigins = getAllowedOriginsFromDb();
  return [...new Set([...ENV_ALLOWED_ORIGINS, ...dbOrigins])];
}

// Valida si un origen está permitido (soporta subdominios y ambos protocolos)
function isOriginAllowed(origin: string | null): boolean {
  // Si está en modo público, permitir todo
  if (isPublicAccess()) return true;

  if (!origin) return false;

  try {
    const url = new URL(origin);
    const hostname = url.hostname;
    const allowedOrigins = getAllowedOrigins();

    return allowedOrigins.some((allowed) => {
      // Normalizar: quitar protocolo si lo tiene
      let allowedHost = allowed.replace(/^https?:\/\//, "");

      // Coincidencia exacta o subdominio
      return hostname === allowedHost || hostname.endsWith("." + allowedHost);
    });
  } catch {
    return false;
  }
}
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "admin123";

// Limpiar tokens expirados cada 10 minutos
setInterval(() => {
  const result = deleteExpiredSessions();
  if (result.changes > 0) {
    console.log(`[DB] Limpiadas ${result.changes} sesiones expiradas`);
  }
}, 600000);

// CORS para permitir requests desde cualquier origen (el token valida)
app.use("/api/*", cors({ origin: "*" }));

// API routes primero
app.post("/api/chat", async (c) => {
  const token = c.req.header("X-Session-Token");
  const session = getSession(token || "");

  if (!session || session.expires.getTime() < Date.now()) {
    return c.json({ error: "Sesión inválida o expirada" }, 401);
  }

  const { messages } = await c.req.json();

  // Guardar el último mensaje del usuario
  const lastMessage = messages[messages.length - 1];
  if (lastMessage?.role === "user") {
    saveChatMessage(token!, "user", lastMessage.content);
  }

  // Stream la respuesta y capturar para guardar
  const startTime = Date.now();
  const result = chat(convertToModelMessages(messages));

  // Guardar respuesta del asistente y usage cuando termine
  Promise.all([result.text, result.usage, result.finishReason]).then(
    ([text, usage, finishReason]) => {
      const latencyMs = Date.now() - startTime;

      if (text) {
        saveChatMessage(token!, "assistant", text);
      }

      // Guardar usage log
      if (usage) {
        saveUsageLog({
          sessionToken: token!,
          model: "gpt-4o-mini-2024-07-18", // TODO: hacer dinámico
          promptTokens: usage.inputTokens || 0,
          completionTokens: usage.outputTokens || 0,
          totalTokens: usage.totalTokens || 0,
          latencyMs,
          finishReason: finishReason || undefined,
        });
      }
    }
  );

  return result.toUIMessageStreamResponse();
});

// Endpoint para recuperar historial de chat
app.get("/api/chat/history", async (c) => {
  const token = c.req.header("X-Session-Token");
  const session = getSession(token || "");

  if (!session || session.expires.getTime() < Date.now()) {
    return c.json({ error: "Sesión inválida o expirada" }, 401);
  }

  const history = getChatHistory(token!);
  return c.json({ messages: history });
});

// ============ ADMIN ROUTES ============
const adminAuth = basicAuth({ username: ADMIN_USER, password: ADMIN_PASS });

// API para estadísticas del admin
app.get("/api/admin/stats", adminAuth, (c) => {
  const activeSessions = getActiveSessions();
  const now = Date.now();

  const sessions = activeSessions.map((s) => ({
    token: s.token.slice(0, 8) + "...",
    origin: s.origin,
    expiresIn: Math.round((s.expires.getTime() - now) / 60000) + " min",
  }));

  // Estadísticas de mensajes
  const messageStats = getMessageStats();
  const messagesByDay = getMessagesByDay(7);
  const messagesByOrigin = getMessagesByOrigin();

  // Estadísticas de uso (tokens, costos, latencia)
  const usageStats = getUsageStats();
  const usageByDay = getUsageByDay(7);
  const usageByOrigin = getUsageByOrigin();

  // Configuración actual
  const config = getAllConfig();

  return c.json({
    activeSessions: sessions.length,
    sessions,
    allowedOrigins: getAllowedOrigins(),
    envOrigins: ENV_ALLOWED_ORIGINS,
    isDev,
    config: {
      publicAccess: config.public_access === "true",
      allowedOrigins: config.allowed_origins || "",
    },
    messages: {
      ...messageStats,
      byDay: messagesByDay,
      byOrigin: messagesByOrigin,
    },
    usage: {
      ...usageStats,
      byDay: usageByDay,
      byOrigin: usageByOrigin,
    },
  });
});

// API para actualizar configuración
app.post("/api/admin/config", adminAuth, async (c) => {
  const body = await c.req.json();

  if (typeof body.publicAccess === "boolean") {
    setConfig("public_access", body.publicAccess ? "true" : "false");
    console.log(`[Config] Acceso público: ${body.publicAccess}`);
  }

  if (typeof body.allowedOrigins === "string") {
    // Limpiar y normalizar orígenes
    const origins = body.allowedOrigins
      .split(",")
      .map((o: string) => o.trim().replace(/^https?:\/\//, ""))
      .filter(Boolean)
      .join(",");
    setConfig("allowed_origins", origins);
    console.log(`[Config] Orígenes actualizados: ${origins || "(ninguno)"}`);
  }

  return c.json({ success: true, config: getAllConfig() });
});

// Dashboard HTML
app.get("/admin", adminAuth, (c) => {
  return c.html(adminDashboardHTML());
});

// ============ WIDGET ROUTES ============

// Ruta del widget (iframe)
app.get("/widget", (c) => {
  const referer = c.req.header("Referer");
  const originHeader = c.req.header("Origin");
  let clientOrigin: string | null = null;

  // Intentar obtener origen del header Origin primero, luego del Referer
  if (originHeader) {
    clientOrigin = originHeader;
  } else if (referer) {
    try {
      clientOrigin = new URL(referer).origin;
    } catch {}
  }

  const publicMode = isPublicAccess();
  console.log(`[Widget] Origin: ${clientOrigin || "(vacío)"} | Público: ${publicMode}`);

  // Validar origen: público, dev, o en lista de permitidos
  const isAllowed = publicMode || isDev || isOriginAllowed(clientOrigin);

  if (!isAllowed) {
    const allowedList = getAllowedOrigins();
    console.log(`[Widget] BLOQUEADO - origen: ${clientOrigin} | permitidos: ${allowedList.join(", ") || "(ninguno)"}`);
    return c.text(`Origen no autorizado: ${clientOrigin || "(vacío)"}. Activa "Acceso Público" o añade tu dominio en el panel.`, 403);
  }

  // Generar token de sesión (expira en 2 horas)
  const token = randomUUID();
  const expiresMs = Date.now() + 7200000;
  createSession(token, clientOrigin || (publicMode ? "public" : "dev"), expiresMs);

  console.log(`[Widget] Token generado para: ${clientOrigin || "(público)"}`);

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
