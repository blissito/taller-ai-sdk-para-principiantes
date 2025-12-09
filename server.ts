import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { basicAuth } from "hono/basic-auth";
import { chat } from "./index.js";
import { convertToModelMessages } from "ai";
import { readFileSync } from "fs";
import { randomUUID } from "crypto";
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
  // Tools CRUD
  getTool,
  getToolByName,
  getAllTools,
  createTool,
  updateTool,
  deleteTool,
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
  if (lastMessage?.role === "user" && lastMessage.content) {
    // El content puede ser string o array (formato multimodal)
    const content = typeof lastMessage.content === "string"
      ? lastMessage.content
      : Array.isArray(lastMessage.content)
        ? lastMessage.content.filter((p: any) => p.type === "text").map((p: any) => p.text).join("\n")
        : null;

    if (content) {
      saveChatMessage(token!, "user", content);
    }
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
    hasApiKey: !!config.openai_api_key || !!process.env.OPENAI_API_KEY,
    apiKeySource: config.openai_api_key ? "db" : (process.env.OPENAI_API_KEY ? "env" : null),
    model: config.model || "gpt-4o-mini",
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

  if (typeof body.openaiApiKey === "string" && body.openaiApiKey.startsWith("sk-")) {
    setConfig("openai_api_key", body.openaiApiKey);
    console.log(`[Config] API Key de OpenAI actualizada`);
  }

  if (typeof body.model === "string") {
    const validModels = ["gpt-4o-mini", "gpt-4.1-mini", "gpt-5-nano", "o4-mini"];
    if (validModels.includes(body.model)) {
      setConfig("model", body.model);
      console.log(`[Config] Modelo actualizado: ${body.model}`);
    }
  }

  return c.json({ success: true, config: getAllConfig() });
});

// API para gestión de herramientas (CRUD con intent)
app.post("/api/admin/tools", adminAuth, async (c) => {
  const { intent, ...data } = await c.req.json();

  switch (intent) {
    case "list":
      return c.json({ tools: getAllTools() });

    case "create": {
      // Validaciones
      if (!data.name || !data.title || !data.description || !data.endpointUrl || !data.inputSchemaJson) {
        return c.json({ error: "Campos requeridos: name, title, description, endpointUrl, inputSchemaJson" }, 400);
      }
      if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(data.name)) {
        return c.json({ error: "El nombre debe comenzar con letra y solo contener letras, números y _" }, 400);
      }
      try { JSON.parse(data.inputSchemaJson); } catch { return c.json({ error: "inputSchemaJson no es JSON válido" }, 400); }
      if (data.headersJson) { try { JSON.parse(data.headersJson); } catch { return c.json({ error: "headersJson no es JSON válido" }, 400); } }
      if (getToolByName(data.name)) {
        return c.json({ error: "Ya existe una herramienta con ese nombre" }, 409);
      }

      const id = randomUUID();
      createTool({
        id,
        name: data.name,
        title: data.title,
        description: data.description,
        inputSchemaJson: data.inputSchemaJson,
        outputSchemaJson: data.outputSchemaJson || undefined,
        endpointUrl: data.endpointUrl,
        httpMethod: data.httpMethod || "POST",
        headersJson: data.headersJson || undefined,
        timeoutMs: data.timeoutMs || 10000,
        requiresConfirmation: data.requiresConfirmation || false,
        navigationUrl: data.navigationUrl || undefined,
        enabled: data.enabled !== false,
      });
      console.log(`[Tools] Herramienta creada: ${data.name}`);
      return c.json({ success: true, id });
    }

    case "update": {
      if (!data.id) return c.json({ error: "Se requiere id" }, 400);
      const existing = getTool(data.id);
      if (!existing) return c.json({ error: "Herramienta no encontrada" }, 404);

      if (data.name && !/^[a-zA-Z][a-zA-Z0-9_]*$/.test(data.name)) {
        return c.json({ error: "El nombre debe comenzar con letra y solo contener letras, números y _" }, 400);
      }
      if (data.inputSchemaJson) { try { JSON.parse(data.inputSchemaJson); } catch { return c.json({ error: "inputSchemaJson no es JSON válido" }, 400); } }
      if (data.headersJson) { try { JSON.parse(data.headersJson); } catch { return c.json({ error: "headersJson no es JSON válido" }, 400); } }
      if (data.name && data.name !== existing.name && getToolByName(data.name)) {
        return c.json({ error: "Ya existe otra herramienta con ese nombre" }, 409);
      }

      updateTool(data.id, {
        name: data.name,
        title: data.title,
        description: data.description,
        inputSchemaJson: data.inputSchemaJson,
        outputSchemaJson: data.outputSchemaJson,
        endpointUrl: data.endpointUrl,
        httpMethod: data.httpMethod,
        headersJson: data.headersJson,
        timeoutMs: data.timeoutMs,
        requiresConfirmation: data.requiresConfirmation,
        navigationUrl: data.navigationUrl,
        enabled: data.enabled,
      });
      console.log(`[Tools] Herramienta actualizada: ${data.id}`);
      return c.json({ success: true });
    }

    case "delete": {
      if (!data.id) return c.json({ error: "Se requiere id" }, 400);
      const existing = getTool(data.id);
      if (!existing) return c.json({ error: "Herramienta no encontrada" }, 404);

      deleteTool(data.id);
      console.log(`[Tools] Herramienta eliminada: ${data.id} (${existing.name})`);
      return c.json({ success: true });
    }

    default:
      return c.json({ error: "Intent inválido. Use: list, create, update, delete" }, 400);
  }
});

// Dashboard HTML (archivo estático)
app.get("/admin", adminAuth, (c) => {
  const html = readFileSync("./client/dist/admin.html", "utf-8");
  return c.html(html);
});

// Preview: página de prueba con el widget embebido
app.get("/preview", adminAuth, (c) => {
  const serverUrl = `${c.req.header("X-Forwarded-Proto") || "http"}://${c.req.header("Host")}`;
  const html = `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Preview - Chat Widget</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        line-height: 1.6;
        margin: 0;
        padding: 0;
      }
      .hero {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 60px 20px;
        text-align: center;
      }
      .hero h1 { font-size: 2.5rem; margin-bottom: 10px; }
      .hero p { font-size: 1.1rem; opacity: 0.9; }
      .content {
        max-width: 800px;
        margin: 0 auto;
        padding: 40px 20px;
      }
      .card {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 24px;
        margin-bottom: 20px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }
      .card h2 { margin-top: 0; color: #1f2937; }
      .card p { color: #6b7280; }
      .controls {
        background: #f3f4f6;
        padding: 20px;
        border-radius: 12px;
        margin-bottom: 30px;
      }
      .controls h3 { margin-top: 0; }
      button {
        background: #3b82f6;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 8px;
        cursor: pointer;
        margin-right: 10px;
        font-size: 14px;
      }
      button:hover { background: #2563eb; }
      button.secondary { background: #6b7280; }
      button.secondary:hover { background: #4b5563; }
      footer {
        text-align: center;
        padding: 40px;
        background: #1f2937;
        color: #9ca3af;
      }
      .back-link {
        display: inline-block;
        margin-top: 15px;
        color: rgba(255,255,255,0.8);
        text-decoration: none;
      }
      .back-link:hover { color: white; }
    </style>
  </head>
  <body>
    <div class="hero">
      <h1>Preview del Widget</h1>
      <p>Pagina de prueba para previsualizar el agente</p>
      <a href="/admin" class="back-link">← Volver al Admin</a>
    </div>
    <div class="content">
      <div class="controls">
        <h3>Controles del Widget (API)</h3>
        <p>Usa estos botones para controlar el widget programaticamente:</p>
        <button onclick="ChatWidget.open()">Abrir Sidebar</button>
        <button onclick="ChatWidget.expand()">Expandir 100%</button>
        <button class="secondary" onclick="ChatWidget.close()">Cerrar</button>
        <button class="secondary" onclick="ChatWidget.toggle()">Toggle</button>
        <p style="margin-top: 10px; font-size: 12px; color: #6b7280">
          Estado actual: <code id="state">closed</code>
        </p>
      </div>
      <div class="card">
        <h2>Contenido de Ejemplo</h2>
        <p>Este contenido se comprime cuando el sidebar del chat se abre. Observa como el layout se ajusta automaticamente.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
      </div>
      <div class="card">
        <h2>Prueba el Chat</h2>
        <p>Haz clic en el boton flotante en la esquina inferior derecha para abrir el chat y probar tu agente.</p>
      </div>
    </div>
    <footer>
      <p>Preview del Chat Widget - <a href="/admin" style="color: #60a5fa;">Volver al Admin</a></p>
    </footer>
    <script src="${serverUrl}/embed.js"></script>
    <script>
      setInterval(() => {
        if (window.ChatWidget) {
          document.getElementById("state").textContent = ChatWidget.getState();
        }
      }, 500);
    </script>
  </body>
</html>`;
  return c.html(html);
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
  const host = c.req.header("Host") || "";
  const isFromPreview = clientOrigin && (clientOrigin.includes(host) || clientOrigin.includes("localhost"));
  console.log(`[Widget] Origin: ${clientOrigin || "(vacío)"} | Público: ${publicMode} | Preview: ${isFromPreview}`);

  // Validar origen: público, dev, preview del mismo servidor, o en lista de permitidos
  const isAllowed = publicMode || isDev || isFromPreview || isOriginAllowed(clientOrigin);

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
