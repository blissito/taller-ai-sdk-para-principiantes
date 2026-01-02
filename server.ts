import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import {
  createMemeFromPhoto,
  generateMemeFromText,
  analyzePhoto,
} from "./index.js";

const PORT = Number(process.env.PORT) || 3000;
const app = new Hono();

// Endpoint para generar meme desde foto + contexto
app.post("/api/meme/from-photo", async (c) => {
  try {
    const { photo, context } = await c.req.json<{
      photo: string; // Base64
      context: string; // El contexto del meme
    }>();

    if (!photo || !context) {
      return c.json({ error: "Se requiere photo y context" }, 400);
    }

    console.log("📸 Recibida solicitud de meme desde foto");
    const result = await createMemeFromPhoto(photo, context);

    return c.json({
      success: true,
      description: result.description,
      memeImage: result.memeImage,
    });
  } catch (error) {
    console.error("Error generando meme:", error);
    return c.json(
      { error: "Error al generar el meme", details: String(error) },
      500
    );
  }
});

// Endpoint para analizar solo la foto (sin generar meme)
app.post("/api/meme/analyze", async (c) => {
  try {
    const { photo } = await c.req.json<{ photo: string }>();

    if (!photo) {
      return c.json({ error: "Se requiere photo" }, 400);
    }

    console.log("📸 Analizando foto...");
    const description = await analyzePhoto(photo);

    return c.json({
      success: true,
      description,
    });
  } catch (error) {
    console.error("Error analizando foto:", error);
    return c.json(
      { error: "Error al analizar la foto", details: String(error) },
      500
    );
  }
});

// Endpoint para generar meme solo desde texto
app.post("/api/meme/from-text", async (c) => {
  try {
    const { prompt } = await c.req.json<{ prompt: string }>();

    if (!prompt) {
      return c.json({ error: "Se requiere prompt" }, 400);
    }

    console.log("🎨 Generando meme desde texto:", prompt);
    const memeImage = await generateMemeFromText(prompt);

    return c.json({
      success: true,
      memeImage,
    });
  } catch (error) {
    console.error("Error generando meme:", error);
    return c.json(
      { error: "Error al generar el meme", details: String(error) },
      500
    );
  }
});

// Servir estáticos del cliente compilado
app.use("/*", serveStatic({ root: "./client/dist" }));

// Fallback SPA: rutas no encontradas -> index.html
app.use("/*", serveStatic({ root: "./client/dist", path: "index.html" }));

serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.info(`🚀 Meme Generator running on port: ${info.port}`);
});
