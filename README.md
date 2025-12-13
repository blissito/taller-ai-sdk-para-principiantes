<p align="left">
  <img src="https://www.fixtergeek.com/logo.png" alt="Fixtergeek" width="200" />
</p>

# AI SDK Workshop

Este repo es el material para el taller de AI-SDK.

Puedes tomarlo aquí: [fixtergeek.com/ai-sdk](https://www.fixtergeek.com/ai-sdk)

> Aprende a construir aplicaciones con IA usando el Vercel AI SDK, desde inferencias básicas hasta UI generativa con artifacts.

[![AI SDK](https://img.shields.io/badge/AI%20SDK-v5-blue)](https://ai-sdk.dev)
[![Hono](https://img.shields.io/badge/Hono-v4-orange)](https://hono.dev)
[![React](https://img.shields.io/badge/React-v19-61dafb)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6)](https://typescriptlang.org)

## Descripción

Un taller práctico y progresivo para dominar el **Vercel AI SDK**. Cada ejercicio construye sobre el anterior, introduciendo un concepto nuevo mientras refuerza los aprendidos.

**Lo que vas a construir:**

- Streams de texto desde modelos de lenguaje
- Chat interactivo con React y el hook `useChat`
- Carga de archivos como contexto para el LLM
- Sistema de embeddings y búsqueda por similitud
- Tools para UI generativa y componentes dinámicos
- Artifacts con streaming dual (código + explicación)

## Requisitos previos

- Node.js 18+
- Una API key de OpenAI (o compatible)
- Conocimientos básicos de TypeScript y React

## Quick Start

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/ai_sdk_curso.git
cd ai_sdk_curso

# Instalar dependencias
npm install
cd client && npm install && cd ..

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tu API key

# Iniciar en modo desarrollo
npm run dev
```

## Ejercicios

Cada ejercicio vive en su propia rama. Navega entre ellos con `git checkout`.

| #     | Rama                               | Tema                        | Conceptos clave                                                            |
| ----- | ---------------------------------- | --------------------------- | -------------------------------------------------------------------------- |
| 00    | `ejercicio/00-basic_inference`     | **Inferencia básica**       | `streamText`, modelo, system prompt, iteración de streams                  |
| 01    | `ejercicio/01-streaming-vanilla`   | **Streaming vanilla**       | `pipeTextStreamToResponse`, `TextDecoder`, arquitectura cliente/servidor   |
| 02    | `ejercicio/02-react-usechat`       | **React + useChat**         | Hook `useChat`, Vite, `pipeUIMessageStreamToResponse`, proxy de desarrollo |
| 03    | `ejercicio/03-upload_context`      | **Contexto desde archivos** | `FileReader`, inyección de contexto, manejo de PDFs                        |
| 04    | `ejercicio/04-embeddings`          | **Embeddings**              | Vectores, similitud semántica, chunking de documentos                      |
| 05    | `ejercicio/05-tools`               | **UI Generativa**           | Tools, renderizado condicional de componentes, system prompts estrictos    |
| 06    | `ejercicio/06-sending_custom_data` | **Artifacts**               | `createUIMessageStream`, `data-custom`, streaming dual                     |
| Bonus | `ejercicio/bonus-migrate_to_hono`  | **Migración a Hono**        | Hono vs Express, `toUIMessageStreamResponse`, `serveStatic`                |

### Progresión recomendada

```
00 → 01 → 02 → 03 → 04 → 05 → 06
 │                              │
 └──────── Bonus: Hono ─────────┘
```

**00 → 01**: De ejecutar en terminal a servir por HTTP
**01 → 02**: De vanilla JS a React con estado gestionado
**02 → 03**: De prompts fijos a contexto dinámico desde archivos
**03 → 04**: De archivos completos a chunks y búsqueda semántica
**04 → 05**: De texto plano a componentes React dinámicos
**05 → 06**: De un solo stream a streaming dual con artifacts

## Navegación entre ejercicios

```bash
# Ver todos los ejercicios disponibles
git branch -a | grep ejercicio

# Cambiar a un ejercicio específico
git checkout ejercicio/02-react-usechat

# Volver al estado final (main)
git checkout main
```

Cada rama tiene su propio README con explicaciones detalladas del ejercicio.

## Stack

| Capa       | Tecnología                                                |
| ---------- | --------------------------------------------------------- |
| AI         | [Vercel AI SDK](https://ai-sdk.dev) v5                    |
| Backend    | [Hono](https://hono.dev) v4                               |
| Frontend   | [React](https://react.dev) v19 + [Vite](https://vite.dev) |
| Lenguaje   | TypeScript 5.9                                            |
| Validación | Zod                                                       |

## Estructura del proyecto

```
ai_sdk_curso/
├── index.ts          # Lógica de inferencia y chat
├── server.ts         # Servidor Hono con endpoints
├── client/           # Aplicación React
│   ├── src/
│   │   └── App.tsx   # Componente principal del chat
│   └── vite.config.ts
├── .env              # Variables de entorno (API keys)
└── package.json
```

## Scripts disponibles

```bash
npm run dev          # Inicia servidor + cliente en paralelo
npm run deploy       # Deploy a producción (Fly.io)
```

## Deploy a producción

El repositorio está **listo para producción** en [Fly.io](https://fly.io). Incluye:

| Archivo      | Propósito                                       |
| ------------ | ----------------------------------------------- |
| `Dockerfile` | Build multi-stage optimizado (builder + runner) |
| `fly.toml`   | Configuración de Fly.io                         |

### Características del setup

- **Multi-stage build**: Separa la compilación del runtime para imágenes más ligeras
- **Usuario no-root**: El contenedor corre con usuario `hono` por seguridad
- **Auto-scaling**: Las máquinas se suspenden cuando no hay tráfico y despiertan automáticamente
- **HTTPS forzado**: Todo el tráfico se redirige a HTTPS
- **Región**: Dallas (dfw) por defecto, configurable en `fly.toml`

### Primeros pasos con Fly.io

```bash
# Instalar CLI de Fly
curl -L https://fly.io/install.sh | sh

# Autenticarse
fly auth login

# Configurar secretos (tu API key)
fly secrets set OPENAI_API_KEY=sk-...

# Deploy
npm run deploy
```

Tu app estará disponible en `https://ai-sdk-curso.fly.dev`

## Recursos

- [Documentación AI SDK](https://ai-sdk.dev/docs)
- [Documentación Hono](https://hono.dev/docs)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)

## Próximas fechas

| Fecha                | Modalidad |
| -------------------- | --------- |
| 13 de diciembre 2024 | En vivo   |
| 20 de diciembre 2024 | En vivo   |

Regístrate en [fixtergeek.com/ai-sdk](https://www.fixtergeek.com/ai-sdk)

## Autor

Creado por [@blissito](https://github.com/blissito)
Para [@fixtergeek](https://www.fixtergeek.com)

---

Si este taller te fue útil, considera darle una estrella al repo.

---

Snipet de código para mostrar las llamadas a las tools en el servidor:

```ts
for await (const part of result.fullStream) {
  switch (part.type) {
    case "tool-call":
      console.log(`\n🔧 ${part.toolName}(${JSON.stringify(part.input)})`);
      break;
    case "tool-result":
      console.log(`   ✅ ${JSON.stringify(part.output)}`);
      break;
    case "text-delta":
      process.stdout.write(part.text);
      break;
  }
}
```

Fullstream es la clave. Completo y en tiempo real. 🤴🏻
