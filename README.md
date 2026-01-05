# Ejercicio 03: Contexto desde archivos

Permitimos al usuario subir archivos de texto que se inyectan como contexto en los mensajes. El modelo usa este contexto para responder preguntas sobre el contenido.

## Flujo de la aplicación

```
[Usuario selecciona archivo.txt]
              ↓
     FileReader.readAsText()
              ↓
     fileContexts state
              ↓
[Usuario envía pregunta]
              ↓
     Construir mensaje:
     <context file="...">contenido</context>
     ---
     pregunta del usuario
              ↓
     sendMessage({ text: fullText })
              ↓
     LLM responde usando el contexto
```

## Conceptos del AI SDK

Este ejercicio no introduce nuevas funciones del AI SDK, pero demuestra un patrón importante: **inyección de contexto** en el prompt.

| Patrón | Descripción |
|--------|-------------|
| Context injection | Agregar contenido de archivos al mensaje |
| System prompt | Instruir al modelo sobre el formato `<context>` |
| stripContextTags | Limpiar tags para mostrar en UI |

## Componentes del cliente

### Input de archivo oculto

```tsx
<input
  type="file"
  ref={fileInputRef}
  onChange={handleFileChange}
  className="hidden"
  multiple
  accept="text/plain,text/markdown,.txt,.md"
/>
```

### Botón con icono de clip

```tsx
<button
  type="button"
  onClick={() => fileInputRef.current?.click()}
  title="Adjuntar archivo"
>
  <PaperclipIcon />
</button>
```

### Estado para archivos

```ts
type FileContext = {
  name: string;
  content: string;
};

const [fileContexts, setFileContexts] = useState<FileContext[]>([]);
```

## Lógica de lectura de archivos

### readFileContent

```ts
async function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
```

### handleFileChange

```ts
const handleFileChange = useCallback(async (e) => {
  if (!e.target.files) return;

  const newContexts = await Promise.all(
    Array.from(e.target.files).map(async (file) => ({
      name: file.name,
      content: await readFileContent(file),
    }))
  );

  setFileContexts((prev) => [...prev, ...newContexts]);
  e.target.value = ""; // Reset para poder subir el mismo archivo
}, []);
```

## Construcción del mensaje con contexto

```ts
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (!input.trim() && fileContexts.length === 0) return;

  // Construir contexto con tags XML
  const contextText = fileContexts
    .map((f) => `<context file="${f.name}">\n${f.content}\n</context>`)
    .join("\n\n");

  const fullText = contextText ? `${contextText}\n\n---\n\n${input}` : input;
  sendMessage({ text: fullText });
  setInput("");
};
```

## Limpieza para display

```ts
function stripContextTags(text: string): string {
  let cleaned = text.replace(/<context[^>]*>[\s\S]*?<\/context>/g, "");
  const separatorIndex = cleaned.indexOf("---");
  if (separatorIndex !== -1) {
    cleaned = cleaned.substring(separatorIndex + 3);
  }
  return cleaned.trim();
}
```

## System Prompt

```txt
Eres un asistente que responde basándose en el contexto proporcionado.

## Formato del contexto
El usuario enviará información en tags <context>:
<context file="documento.txt">
contenido del archivo
</context>

## Instrucciones
- Basa tus respuestas en el contenido de <context>
- Si hay URLs en el contexto, inclúyelas
- Si no puedes responder con el contexto, indícalo
- Si no hay contexto, pide al usuario que suba un archivo
```

## Estructura del proyecto

```
├── index.ts           # Función chat
├── server.ts          # Express API
├── system.txt         # System prompt
└── client/
    └── src/
        └── App.tsx    # UI con file input
```

## Ejecución

```bash
npm install
cd client && npm install && cd ..
npm run dev
```

## Limitaciones

- El contexto completo se envía en cada mensaje
- Archivos grandes exceden límite de tokens
- Sin búsqueda semántica (todo va al prompt)

El siguiente ejercicio (04-embeddings) resuelve estas limitaciones con chunking y búsqueda vectorial.

## Lo que aprenderás

1. **FileReader API** - Leer archivos del cliente
2. **Context injection** - Inyectar contexto en prompts
3. **XML tags pattern** - Estructurar contexto con `<context>`
4. **System prompt design** - Instruir al modelo sobre formatos
5. **stripContextTags** - Limpiar contexto para UI

---

Que lo disfrutes. Abrazo. bliss
