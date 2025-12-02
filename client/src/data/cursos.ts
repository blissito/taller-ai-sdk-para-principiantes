export type Curso = {
  id: string;
  titulo: string;
  slug: string;
  descripcion: string;
  duracion: string;
  nivel: "Principiante" | "Intermedio" | "Avanzado";
  imagen: string;
  precio: number | null; // null = gratis
  tags: string[];
  destacado?: boolean;
  url?: string;
};

export const cursos: Curso[] = [
  {
    id: "ai-sdk",
    titulo: "AI SDK de Vercel con React",
    slug: "ai-sdk",
    descripcion:
      "Aprende a integrar IA en aplicaciones web con el AI SDK de Vercel. Streaming, useChat, RAG, embeddings y patrones de UI para chatbots.",
    duracion: "8h",
    nivel: "Intermedio",
    imagen: "https://i.imgur.com/ai-sdk-cover.png",
    precio: 999,
    tags: ["IA", "React", "Vercel", "AI SDK", "LLMs"],
    destacado: true,
    url: "https://fixtergeek.com/cursos/ai-sdk",
  },
  {
    id: "gemini-cli",
    titulo: "Domina Gemini CLI como un experto",
    slug: "domina-gemini-cli",
    descripcion:
      "Aprende a usar Gemini CLI desde la terminal. Perfecto para quienes inician con IA y quieren productividad sin código complejo.",
    duracion: "6h",
    nivel: "Principiante",
    imagen: "https://i.imgur.com/RcuQqYV.png",
    precio: 499,
    tags: ["IA", "CLI", "Gemini", "Productividad"],
  },
  {
    id: "claude-code",
    titulo: "Power-User en Claude Code",
    slug: "power-user-en-claude-code",
    descripcion:
      "Domina Claude Code para productividad extrema. Aprende técnicas avanzadas, hooks, MCP servers y automatización de workflows.",
    duracion: "2h",
    nivel: "Avanzado",
    imagen:
      "https://anthropic.gallerycdn.vsassets.io/extensions/anthropic/claude-code/1.0.85/1755637900866/Microsoft.VisualStudio.Services.Icons.Default",
    precio: 499,
    tags: ["IA", "Claude", "Productividad", "CLI"],
    destacado: true,
  },
  {
    id: "react-router",
    titulo: "Introducción al desarrollo Full Stack con React Router",
    slug: "Introduccion-al-desarrollo-web-full-stack-con-React-Router",
    descripcion:
      "Aprende los fundamentos de desarrollo web full-stack con React Router v7. Sin Redux, con velocidad optimizada.",
    duracion: "1h",
    nivel: "Principiante",
    imagen: "https://i.imgur.com/MwMMNRn.png",
    precio: null, // GRATIS
    tags: ["React", "Full Stack", "React Router", "Gratis"],
  },
  {
    id: "motion",
    titulo: "Construye +14 componentes animados con React y Motion",
    slug: "construye-mas-de-14-componentes-animados-con-react-y-motion",
    descripcion:
      "Crea animaciones profesionales para tu portafolio. 14 componentes listos para usar con Framer Motion.",
    duracion: "10h",
    nivel: "Intermedio",
    imagen: "https://i.imgur.com/aThPBNV.png",
    precio: 999,
    tags: ["React", "Animaciones", "Motion", "UI"],
  },
  {
    id: "chatgpt-node",
    titulo: "Construye tu propio ChatGPT con Node.js y OpenAI",
    slug: "construye-tu-propio-chatgpt-con-nodejs-y-openai",
    descripcion:
      "Crea un clon de ChatGPT desde cero usando Node.js y la API de OpenAI. Streaming, contexto y más.",
    duracion: "1h",
    nivel: "Intermedio",
    imagen: "https://i.imgur.com/um43989.png",
    precio: 299,
    tags: ["IA", "Node.js", "OpenAI", "ChatGPT"],
  },
];

export const getCursoBySlug = (slug: string) =>
  cursos.find((c) => c.slug === slug);

export const getCursosByTag = (tag: string) =>
  cursos.filter((c) => c.tags.includes(tag));

export const getCursosDestacados = () => cursos.filter((c) => c.destacado);

export const getCursosGratis = () => cursos.filter((c) => c.precio === null);
