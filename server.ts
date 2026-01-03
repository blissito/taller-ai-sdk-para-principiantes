import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { tutor } from "./index.js";
import type { UIMessage } from "ai";

const PORT = Number(process.env.PORT) || 3000;
const app = new Hono();

// Endpoint principal del TypeScript Tutor
app.post("/api/chat", async (c) => {
  try {
    const { messages } = await c.req.json<{ messages: UIMessage[] }>();

    if (!messages || messages.length === 0) {
      return c.json({ error: "Se requieren mensajes" }, 400);
    }

    console.log("\n📚 Nueva pregunta al TypeScript Tutor");
    const lastMessage = messages[messages.length - 1];
    const textPart = lastMessage?.parts?.find((p) => p.type === "text");
    if (textPart && textPart.type === "text") {
      console.log(`   Mensaje: ${textPart.text.slice(0, 50)}...`);
    }

    // El tutor devuelve una Response con streaming dual
    return tutor(messages);
  } catch (error) {
    console.error("Error en el tutor:", error);
    return c.json(
      { error: "Error al procesar la pregunta", details: String(error) },
      500
    );
  }
});

// Servir estáticos del cliente compilado
app.use("/*", serveStatic({ root: "./client/dist" }));

// Fallback SPA
app.use("/*", serveStatic({ root: "./client/dist", path: "index.html" }));

serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.info(`\n🎓 TypeScript Tutor running on port: ${info.port}`);
  console.info(`   Pregunta sobre types, functions, interfaces...\n`);
});
