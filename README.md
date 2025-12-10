## Contexto desde archivos

Para simplificar este ejercicio, ya he colocado un archivo que contiene nuestra info en forma de prompt, y le he puesto, muy creativamente, `prompt.txt`.

## Interfaz

Para el cliente hemos diseñado un botón con el icono de un clip 📎 que se colocará a la izquierda del input, para que el usuario pueda seleccionar archivos de su computadora y usarlos dentro del contexto.

> 👀 Aún no estaremos dividiendo el contenido de estos archivos en pedacitos, eso lo haremos en el siguiente ejercicio. Por ahora: lograremos extraer el contenido del archivo seleccionado y lo inyectaremos en el siguiente mensaje (o llamada al LLM). 🔥

![Clip button](/images/clip.png)

### Componentes

Para alcanzar esta funcionalidad requerimos de algunas piezas nuevas. 🛠️

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

Para recibir correctamente el archivo y poder abrir el selector, un input con `type="file"` es necesario.
Pero, también necesitamos un gatillo:

```tsx
<button
  type="button"
  onClick={() => fileInputRef.current?.click()}
  className="p-3 text-gray-500 hover:text-blue-500 hover:bg-gray-100 rounded-lg transition-colors"
  title="Adjuntar archivo"
>
  <PaperclipIcon />
</button>
```

Y, claro, para que todo esto funcione, pues la referencia.

```ts
const fileInputRef = useRef<HTMLInputElement>(null);
```

### Estado para los archivos

Necesitamos un tipo y un estado para almacenar los archivos cargados:

```ts
type FileContext = {
  name: string;
  content: string;
};

const [fileContexts, setFileContexts] = useState<FileContext[]>([]);
```

### Lógica del cliente

Del lado de la lógica necesitamos también un par de funciones: un handler para procesar el archivo seleccionado y una función auxiliar que nos permita obtener el contenido del archivo.

```ts
// El handler para el input de tipo archivo
const handleFileChange = useCallback(
  async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const newContexts = await Promise.all(
      Array.from(e.target.files).map(async (file) => ({
        name: file.name,
        content: await readFileContent(file),
      }))
    );

    setFileContexts((prev) => [...prev, ...newContexts]);
    e.target.value = "";
  },
  []
);

// También el lector del contenido:
async function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
```

Me gusta jugar con promesas. 🪀 Una vez que uno las entiende no las evita, uno se vuelve fan y las usa. 🤓

### Envío del mensaje con contexto

En el `handleSubmit` construimos el mensaje incluyendo el contexto de los archivos cargados:

```ts
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (!input.trim() && fileContexts.length === 0) return;

  // Construimos el mensaje incluyendo el contexto del archivo
  const contextText =
    fileContexts.length > 0
      ? fileContexts
          .map((f) => `<context file="${f.name}">\n${f.content}\n</context>`)
          .join("\n\n")
      : "";

  const fullText = contextText ? `${contextText}\n\n---\n\n${input}` : input;
  sendMessage({ text: fullText });
  setInput("");
  // Mantenemos fileContexts para que persista entre mensajes
};
```

### Limpiando el contexto del display

Para evitar mostrar el contenido del contexto en los mensajes del usuario, usamos una función que limpia los tags:

```ts
function stripContextTags(text: string): string {
  // Remove all <context>...</context> blocks
  let cleaned = text.replace(/<context[^>]*>[\s\S]*?<\/context>/g, "");
  // Remove separator
  const separatorIndex = cleaned.indexOf("---");
  if (separatorIndex !== -1) {
    cleaned = cleaned.substring(separatorIndex + 3);
  }
  return cleaned.trim();
}
```

## Servidor

El servidor es muy sencillo, solo recibe los mensajes y los pasa al modelo:

```ts
import express from "express";
import { chat } from ".";

const app = express();
app.use(express.json());

app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;
  const result = chat(messages);
  result.pipeUIMessageStreamToResponse(res);
});
```

## System Prompt

Para que el modelo entienda el formato de contexto, configuramos un system prompt específico:

```txt
Eres un asistente inteligente que responde preguntas basándose en el contexto proporcionado.

## Formato del contexto
El usuario te enviará información dentro de tags <context>. Por ejemplo:
<context file="documento.txt">
contenido del archivo aquí
</context>

DEBES usar este contenido para responder las preguntas del usuario.

## Instrucciones
- Responde de forma amigable y concisa
- Basa tus respuestas en el contenido dentro de los tags <context>
- Si hay URLs o enlaces en el contexto, inclúyelos en tu respuesta
- Si la pregunta no puede responderse con el contexto, indícalo
- Si no hay contexto, pide al usuario que suba un archivo
```

## Limitaciones de este enfoque

Esta es una demostración de cómo podemos enviar mensajes junto con el contexto extraído de un archivo. ✅ Sin embargo, es un ejercicio para visualizar mejor pero que **no escala bien**. 😗

- El contexto se envía completo en cada mensaje
- Archivos grandes pueden exceder el límite de tokens
- No hay búsqueda semántica (todo el contenido va al prompt)

Para poder pensar en cientos de archivos hay que pensar en miles de pedacitos. 🧱 Y eso es justo lo que haremos en el siguiente ejercicio: haremos todos estos archivos pedacitos y los pondremos en una base de datos con embeddings. 🔎

## BONUS: Enviando PDFs al modelo

¿Podrías imaginar una mejor implementación? ¿Tal vez, que se reciba el contenido o el archivo mismo desde el cliente?

Aquí un ejemplo de cómo pasar un PDF directamente al modelo (requiere modelos con soporte de archivos):

```ts
export const chatWithPDF = (messages: UIMessage[]) => {
  const msgs = convertToModelMessages(messages);
  const fileAlreadyLoaded = msgs.find(
    (msj) => msj.role === "assistant" && msj.content[0].type === "file"
  );

  if (fileAlreadyLoaded) {
    return streamText({
      model,
      system,
      messages: msgs,
    });
  }

  return streamText({
    model,
    system,
    messages: [
      ...msgs,
      {
        role: "assistant",
        content: [
          {
            type: "file",
            mediaType: "application/pdf",
            data: readFileSync("/prompt.pdf"),
          },
        ],
      },
    ],
  });
};
```

> 💡 `fileAlreadyLoaded` intenta evitar la carga múltiple del archivo en cada turno de la conversación.

Que lo disfrutes. Abrazo. bliss 🦾
