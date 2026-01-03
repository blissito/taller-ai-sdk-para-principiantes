# Ejercicio 07: Generador de Thumbnails

Generador de thumbnails con IA usando AI SDK 6. El flujo tiene dos pasos: explorar propuestas visuales y generar formatos para diferentes plataformas.

## Flujo de la aplicación

```
[Título del video]
       ↓
   PASO 1: Explorar
       ↓
┌─────────────────────────────┐
│  🎨 Vibrante   ✨ Mínimo    │  ← 4 propuestas (1 por estilo)
│  🎬 Dramático  🚀 Tech      │
└─────────────────────────────┘
       ↓ (seleccionar una)
   PASO 2: Generar formatos
       ↓
┌─────────────────────────────┐
│  YouTube · Instagram · Story │  ← 3 formatos diferentes
└─────────────────────────────┘
```

## Conceptos del AI SDK

### generateImage

Genera imágenes a partir de texto:

```ts
import { generateImage } from "ai";
import { openai } from "@ai-sdk/openai";

const { image } = await generateImage({
  model: openai.image("gpt-image-1"),
  prompt: "Un paisaje futurista al atardecer",
  size: "1024x1024",
});

const base64 = image.base64;
```

### generateText + generateImage (Pipeline)

Usamos GPT para crear prompts optimizados antes de generar la imagen:

```ts
// 1. GPT-4o-mini crea un prompt optimizado
const { text: prompt } = await generateText({
  model: openai("gpt-4o-mini"),
  prompt: `Crea un prompt de imagen para: "${titulo}"`,
});

// 2. El modelo de imagen genera con ese prompt
const { image } = await generateImage({
  model: openai.image("gpt-image-1"),
  prompt,
});
```

### OpenAI images.edit

Para redimensionar manteniendo el estilo, usamos la API de edición:

```ts
import OpenAI, { toFile } from "openai";

const openai = new OpenAI();

const response = await openai.images.edit({
  model: "gpt-image-1",
  image: await toFile(Buffer.from(base64, "base64"), "ref.png"),
  prompt: "Mantén el mismo diseño y estilo",
  size: "1536x1024", // YouTube landscape
});

const resultado = response.data[0].b64_json;
```

## Tamaños por plataforma

| Formato   | Tamaño    | Uso                    |
| --------- | --------- | ---------------------- |
| YouTube   | 1536x1024 | Thumbnails, Twitter    |
| Instagram | 1024x1024 | Posts cuadrados        |
| Story     | 1024x1536 | Stories, Reels, TikTok |

## Estilos disponibles

| Estilo   | Descripción                            |
| -------- | -------------------------------------- |
| Vibrant  | Colores vivos, alto contraste          |
| Minimal  | Limpio, espacios blancos               |
| Dramatic | Cinematográfico, tonos oscuros         |
| Tech     | Futurista, acentos neón                |

## Estructura del proyecto

```
├── thumbnail-generator.ts   # Lógica de generación
├── server.ts                # API con Hono
└── client/
    └── src/
        └── App.tsx          # UI React
```

## API Endpoints

```bash
# Paso 1: Genera 4 previews (1 por estilo)
POST /api/previews
{ "title": "Nuevo curso de React" }

# Paso 2: Genera 3 formatos desde una referencia
POST /api/formats
{ "reference": "<base64>", "prompt": "<prompt usado>" }

# Estilos disponibles
GET /api/styles
```

## Ejecución

```bash
# Instalar dependencias
npm install
cd client && npm install && cd ..

# Iniciar servidor (puerto 3000)
npm run dev

# En otra terminal, iniciar cliente (puerto 5173)
cd client && npm run dev
```

Abre http://localhost:5173

## Costos aproximados

| Paso     | Modelo            | USD        | MXN         |
| -------- | ----------------- | ---------- | ----------- |
| Previews | gpt-image-1-mini  | ~$0.04 × 4 | ~$0.80 × 4  |
| Formatos | gpt-image-1 (edit)| ~$0.05 × 3 | ~$1.00 × 3  |
| **Total**|                   | **~$0.31** | **~$6.20**  |

*Tipo de cambio: 1 USD ≈ 20 MXN*

## Lo que aprenderás

1. **generateImage** - Generar imágenes con AI SDK
2. **Pipeline texto→imagen** - Optimizar prompts con LLM
3. **images.edit** - Redimensionar manteniendo estilo
4. **Promise.allSettled** - Manejar fallos parciales
5. **Diferentes sizes** - Adaptar a múltiples plataformas

---

Que lo disfrutes. Abrazo. bliss
