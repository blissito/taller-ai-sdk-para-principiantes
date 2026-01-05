# Ejercicio 05: Tools y UI Generativa

En este ejercicio, vamos a explorar el renderizado de componentes en medio de la conversación. 🎨

¿Te imaginas que el modelo no solo responda con texto, sino que decida mostrar una tarjeta visual de un curso cuando sea relevante? Eso es UI generativa: el modelo decide qué componentes renderizar. 🤯

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

## Las tools son funciones que el modelo puede ejecutar

Aquí nos ayudamos con las llamadas a las tools buscándolas dentro de las `parts` de los mensajes, usando su llave `type`.

Para definir una tool usamos la función `tool()` del AI SDK:

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

La descripción es clave 🔑. Entre más clara sea, mejor entenderá el modelo cuándo usarla.

## Pasando tools a streamText

Las tools se pasan como un objeto donde cada key es el nombre de la tool:

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
  stopWhen: stepCountIs(2), // Máximo 2 pasos
});
```

## El System Prompt se vuelve estricto

También notarás que el system prompt se ha vuelto más estricto y específico con el uso de las tools. Esto es importante porque queremos que el modelo **siempre** use la tool cuando mencione un curso, no que invente información.

```txt
## REGLAS ABSOLUTAS
1. NO TIENES información sobre cursos en tu conocimiento interno
2. SIEMPRE que menciones un curso, DEBES llamar showCourse() PRIMERO
3. NUNCA describas cursos con texto - la herramienta genera la UI
4. Responde BREVEMENTE después de llamar la herramienta
```

Sin estas reglas estrictas, el modelo a veces decide no usar la tool y responder con texto. 🙄

## Controlando el loop de herramientas

Cuando el modelo usa tools, entra en un "loop" donde puede:
1. Llamar una tool
2. Recibir el resultado
3. Decidir si llamar otra tool o responder con texto

Podemos controlar este comportamiento:

```ts
streamText({
  // ...
  prepareStep: ({ stepNumber }) => {
    if (stepNumber === 0) {
      return { toolChoice: "auto" }; // Puede usar tools
    }
    return { toolChoice: "none" };   // Solo texto
  },
  stopWhen: stepCountIs(2), // Máximo 2 pasos
  onStepFinish: ({ stepType, toolCalls, text }) => {
    console.log("stepType:", stepType);
    console.log("toolCalls:", toolCalls);
  },
});
```

| toolChoice | Comportamiento |
|------------|----------------|
| `"auto"` | El modelo decide si usar tools |
| `"none"` | No puede usar tools (solo texto) |
| `"required"` | DEBE usar una tool |

## UI Generativa en el cliente

El AI SDK expone los resultados de tools como `parts` con tipo dinámico. Cada tool tiene su propio tipo: `tool-${toolName}`.

```tsx
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

| Estado | Descripción |
|--------|-------------|
| `input-available` | Tool fue llamada, esperando resultado |
| `output-available` | Tool terminó, `part.output` disponible |

Fíjate cómo podemos mostrar un spinner mientras la tool ejecuta, y luego renderizar el componente cuando tenemos el resultado. ✨

## Estructura del proyecto

```
├── index.ts           # Definición de tools + streamText
├── server.ts          # API endpoints
├── cursos.ts          # Datos de cursos
├── system.txt         # System prompt estricto
└── client/
    └── src/
        ├── App.tsx           # Renderizado de tool parts
        └── components/
            └── CursoCard.tsx # Componente de curso
```

## Ejecución

```bash
npm install
cd client && npm install && cd ..
npm run dev
```

## Lo que aprenderás

1. **tool()** - Definir herramientas que el modelo puede ejecutar
2. **UI Generativa** - Renderizar componentes desde tool results
3. **part.type === "tool-X"** - Detectar tools en el cliente
4. **prepareStep** - Control por paso del loop
5. **stopWhen** - Limitar pasos del agente
6. **System prompts estrictos** - Forzar uso consistente de tools

---

Que lo disfrutes. Abrazo. bliss 🦾
