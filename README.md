# Ejercicio 05: Tools y UI Generativa

Implementamos tools que el modelo puede ejecutar y renderizamos componentes React basados en sus resultados. El modelo decide cuándo mostrar una tarjeta de curso, creando una UI generativa.

## Flujo de la aplicación

```
[Usuario: "Quiero aprender IA"]
           ↓
    LLM analiza intent
           ↓
    Decide llamar tool
    showCourse("ai-sdk")
           ↓
    Tool ejecuta y retorna Curso
           ↓
    Cliente detecta part.type
    === "tool-showCourse"
           ↓
    Renderiza <CursoCard />
           ↓
    LLM genera texto explicativo
```

## Conceptos del AI SDK

### tool()

Define una herramienta que el modelo puede invocar:

```ts
import { tool } from "ai";
import { z } from "zod";

const showCourse = tool({
  description: "Muestra una tarjeta visual de un curso",
  inputSchema: z.object({
    courseId: z.string().describe("ID del curso: ai-sdk, motion, etc"),
  }),
  execute: async ({ courseId }) => {
    const curso = cursos.find((c) => c.id === courseId);
    return curso || cursos[0];
  },
});
```

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `description` | `string` | Explica al modelo cuándo usar la tool |
| `inputSchema` | `ZodSchema` | Valida y tipifica los argumentos |
| `execute` | `async function` | Lógica que se ejecuta cuando el modelo llama la tool |

### Pasando tools a streamText

```ts
import { streamText, stepCountIs } from "ai";

const result = streamText({
  model,
  system: baseSystem,
  messages: convertToModelMessages(messages),
  tools: {
    searchContext,  // Tool para RAG
    showCourse,     // Tool para UI generativa
  },
  stopWhen: stepCountIs(2), // Máximo 2 pasos (tool + respuesta)
});
```

### prepareStep - Control por paso

Configura el comportamiento en cada paso del loop:

```ts
streamText({
  // ...
  prepareStep: ({ stepNumber }) => {
    if (stepNumber === 0) {
      return { toolChoice: "auto" }; // Paso 1: puede usar tools
    }
    return { toolChoice: "none" };   // Paso 2: solo texto
  },
});
```

| toolChoice | Comportamiento |
|------------|----------------|
| `"auto"` | El modelo decide si usar tools |
| `"none"` | No puede usar tools (solo texto) |
| `"required"` | DEBE usar una tool |
| `{ type: "tool", toolName: "..." }` | DEBE usar tool específica |

### onStepFinish - Debug del loop

```ts
streamText({
  // ...
  onStepFinish: ({ stepType, toolCalls, toolResults, text }) => {
    console.log("stepType:", stepType);      // "initial" | "tool-result"
    console.log("toolCalls:", toolCalls);    // Tools que se llamaron
    console.log("toolResults:", toolResults); // Resultados
    console.log("text:", text);               // Texto generado
  },
});
```

## UI Generativa en el cliente

### Detectando tool results en parts

El AI SDK expone los resultados de tools como `parts` con tipo dinámico:

```tsx
// En App.tsx
{m.parts.map((part, i) => {
  // Texto normal
  if (part.type === "text") {
    return <Streamdown key={i}>{part.text}</Streamdown>;
  }

  // Tool: showCourse
  if (part.type === "tool-showCourse") {
    if (part.state === "output-available") {
      const curso = part.output as Curso;
      return <CursoCard key={i} curso={curso} />;
    }
    if (part.state === "input-available") {
      return <ToolBadge key={i} name="showCourse" loading />;
    }
  }

  return null;
})}
```

### Estados de las parts

| Estado | Descripción |
|--------|-------------|
| `input-available` | Tool fue llamada, esperando resultado |
| `output-available` | Tool terminó, `part.output` disponible |

### Componente CursoCard

```tsx
type Curso = {
  id: string;
  titulo: string;
  descripcion: string;
  duracion: string;
  nivel: "Principiante" | "Intermedio" | "Avanzado";
  imagen: string;
  precio: number | null;
  tags: string[];
  url: string;
};

function CursoCard({ curso }: { curso: Curso }) {
  return (
    <a href={curso.url} className="block border rounded-lg p-4 hover:shadow">
      <img src={curso.imagen} alt={curso.titulo} />
      <h3>{curso.titulo}</h3>
      <p>{curso.descripcion}</p>
      <span>{curso.duracion}</span>
      <span>{curso.nivel}</span>
      {curso.precio && <span>${curso.precio} MXN</span>}
    </a>
  );
}
```

## System Prompt estricto

Para que el modelo use tools consistentemente:

```txt
Eres Fixter, asistente de Fixtergeek.

## Tools
1. searchContext(query) - Busca en documentos subidos
2. showCourse(courseId) - Muestra tarjeta visual de curso

## REGLAS ABSOLUTAS
1. NO TIENES información sobre cursos en tu conocimiento interno
2. SIEMPRE que menciones un curso, DEBES llamar showCourse() PRIMERO
3. NUNCA describas cursos con texto - la herramienta genera la UI
4. Responde BREVEMENTE después de llamar la herramienta

IDs: ai-sdk, gemini-cli, claude-code, react-router, motion, chatgpt-node
```

## Estructura del proyecto

```
├── index.ts           # Definición de tools + streamText
├── server.ts          # API endpoints
├── cursos.ts          # Datos de cursos
├── system.txt         # System prompt estricto
└── client/
    └── src/
        ├── App.tsx           # Renderizado de tool parts
        ├── components/
        │   └── CursoCard.tsx # Componente de curso
        └── data/
            └── cursos.ts     # Tipos compartidos
```

## API Endpoints

```bash
# Chat con tools
POST /api/chat
{ "messages": [...], "sessionId": "uuid" }

# Embeddings para searchContext (del ejercicio anterior)
POST /api/embed
POST /api/search
```

## Ejecución

```bash
npm install
cd client && npm install && cd ..
npm run dev
```

## Lo que aprenderás

1. **tool()** - Definir herramientas con Zod schemas
2. **UI Generativa** - Renderizar componentes desde tool results
3. **part.type === "tool-X"** - Detectar tools en el cliente
4. **prepareStep** - Control del loop de herramientas
5. **stopWhen** - Limitar pasos del agente
6. **System prompts estrictos** - Forzar uso de tools

---

Que lo disfrutes. Abrazo. bliss
