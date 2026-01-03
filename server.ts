import "dotenv/config";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { generatePreviews, generateFormats, STYLES, type Style } from "./thumbnail-generator.js";

const app = new Hono();

// Parsear errores de OpenAI para mensajes amigables
function parseError(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);

  if (msg.includes("insufficient_quota") || msg.includes("exceeded your current quota")) {
    return "Sin créditos de OpenAI. Agrega fondos en platform.openai.com/settings/organization/billing";
  }
  if (msg.includes("rate_limit")) {
    return "Límite de velocidad alcanzado. Espera unos segundos e intenta de nuevo.";
  }
  if (msg.includes("invalid_api_key")) {
    return "API key de OpenAI inválida. Verifica tu configuración.";
  }

  return msg;
}

// PASO 1: Genera 4 previews (1 por estilo)
app.post("/api/previews", async (c) => {
  try {
    const { title } = await c.req.json<{ title: string }>();

    if (!title) return c.json({ error: "Falta título" }, 400);

    console.log(`\n🎨 Generando 4 previews (1 por estilo): "${title}"`);
    const result = await generatePreviews(title);
    console.log("✅ Previews listos");

    return c.json(result);
  } catch (error) {
    const message = parseError(error);
    console.error("❌ Error en /api/previews:", message);
    return c.json({ error: message }, 500);
  }
});

// PASO 2: Genera 3 formatos desde referencia
app.post("/api/formats", async (c) => {
  try {
    const { reference, prompt } = await c.req.json<{
      reference: string;
      prompt: string;
    }>();

    if (!reference || !prompt) return c.json({ error: "Falta referencia o prompt" }, 400);

    console.log("\n🖼️ Generando 3 formatos desde referencia...");
    const formats = await generateFormats(reference, prompt);
    console.log("✅ Formatos listos");

    return c.json({ formats });
  } catch (error) {
    const message = parseError(error);
    console.error("❌ Error en /api/formats:", message);
    return c.json({ error: message, formats: [] }, 500);
  }
});

// Estilos disponibles
app.get("/api/styles", (c) => c.json(STYLES));

// Static files
app.use("/*", serveStatic({ root: "./client/dist" }));
app.use("/*", serveStatic({ root: "./client/dist", path: "index.html" }));

serve({ fetch: app.fetch, port: 3000 }, () => {
  console.log("\n🎨 Thumbnail Generator → http://localhost:3000");
});
