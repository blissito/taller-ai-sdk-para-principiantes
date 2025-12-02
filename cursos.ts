export type Curso = {
  id: string;
  titulo: string;
  slug: string;
  descripcion: string;
  duracion: string;
  nivel: "Principiante" | "Intermedio" | "Avanzado";
  imagen: string;
  precio: number | null;
  tags: string[];
  url: string;
};

export const cursos: Curso[] = [
  {
    id: "ai-sdk",
    titulo: "Integra IA en tus Proyectos web con el AI SDK",
    slug: "ai-sdk",
    descripcion:
      "Aprende a crear agentes inteligentes y chats con IA. Curso en vivo con Héctor Bliss: TypeScript, NodeJS, ExpressJS, React, streaming, tools y RAG.",
    duracion: "7h (2 sesiones de 3.5h)",
    nivel: "Principiante",
    imagen: "https://i.imgur.com/oTTV5Us.png",
    precio: 4990,
    tags: ["IA", "React", "TypeScript", "AI SDK", "Agentes", "RAG"],
    url: "https://www.fixtergeek.com/ai-sdk",
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
    url: "https://fixtergeek.com/cursos/domina-gemini-cli",
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
    url: "https://fixtergeek.com/cursos/power-user-en-claude-code",
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
    precio: null,
    tags: ["React", "Full Stack", "React Router", "Gratis"],
    url: "https://fixtergeek.com/cursos/Introduccion-al-desarrollo-web-full-stack-con-React-Router",
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
    url: "https://fixtergeek.com/cursos/construye-mas-de-14-componentes-animados-con-react-y-motion",
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
    url: "https://fixtergeek.com/cursos/construye-tu-propio-chatgpt-con-nodejs-y-openai",
  },
];

// Buscar cursos por tag (case insensitive)
export function getCoursesByTag(tag: string): Curso[] {
  const normalizedTag = tag.toLowerCase();
  return cursos.filter((curso) =>
    curso.tags.some((t) => t.toLowerCase().includes(normalizedTag))
  );
}

// Buscar cursos por nivel
export function getCoursesByLevel(
  nivel: "Principiante" | "Intermedio" | "Avanzado"
): Curso[] {
  return cursos.filter((curso) => curso.nivel === nivel);
}

// Buscar curso por ID
export function getCourseById(id: string): Curso | undefined {
  return cursos.find((curso) => curso.id === id);
}

// Búsqueda general (por título, descripción o tags)
export function searchCourses(query: string): Curso[] {
  const normalizedQuery = query.toLowerCase();
  return cursos.filter(
    (curso) =>
      curso.titulo.toLowerCase().includes(normalizedQuery) ||
      curso.descripcion.toLowerCase().includes(normalizedQuery) ||
      curso.tags.some((t) => t.toLowerCase().includes(normalizedQuery))
  );
}
