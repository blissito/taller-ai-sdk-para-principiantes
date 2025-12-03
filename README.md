## Contexto desde archivos

Para simplificar este ejercicio, ya he colocado un archivo que contiene nuestra info en forma de prompt, y le he puesto, muy creativamente, `prompt.txt`.

## Interfaz

Para el cliente hemos diseñado un botón con el icono de un clip 📎 que se colocará a la izquierda del input, para que el usuario pueda seleccionar archivos de su computadora y usarlos dentro del contexto.

> 👀 Aún no estaremos dividiendo el contenido de estos archivos en pedacitos, eso lo haremos en el siguiente ejercicio. Por ahora: lograremos extraer el contenido del archivo seleccionado y lo inyectaremos en el siguiente mensaje (o llamada al LLM). 🔥

![Clip button](/images/clip.png)

### Componentes

Para alcanzar esta funcionalidad requerimos de algunas piezas nuevas. 🛠️

```ts
<input
  type="file"
  ref={fileInputRef}
  onChange={handleFileChange}
  className="hidden"
  multiple
  accept="text/plain,text/markdown,.txt,.md,.pdf,application/pdf,image/*"
/>
```

Para recibir correctamente el archivo y poder abrir el selector, un input con `type="file"` es necesario.
Pero, también necesitamos un gatillo:

```ts
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

Del lado de la lógica necesitamos también un par de funciones: un handler para procesar el archivo seleccionado y una función auxiliar que nos permita obtener el contenido del archivo que puede variar ampliamente en extensión (.md, .pdf, .txt, etc.).

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
    // Una belleza ¿apoco no?
  });
}
```

Me gusta jugar con promesas. 🪀 Una vez que uno las entiende no las evita, uno se vuelve fan y las usa. 🤓

## Servidor

Para el server se trata solo de recibir la petición hecha por el cliente en el `hanldeSubmit`.

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

Esta es una demostración de cómo podemos enviar mensajes junto con el contexto extraído de un archivo. ✅ Sin embargo, es un ejercicio para visualizar mejor pero que no escala bien. 😗
Para poder pensar en cientos de archivos hay que pensar en miles de pedacitos. 🧱 Y eso es justo lo que haremos en el siguiente ejercicio, haremos todos estos archivos pedacitos y los podríamos poner en una base de datos. 🔎

## BONUS

Estoy leyendo los docs para enviar un documento PDF como parte de los mensajes.
¿Podrías imaginar una mejor implementación? ¿Tal vez, que se reciba el contenido o el archivo mismo desde el cliente y tal vez, trabajar con otro tipo de datos. 🤷🏻
`fileAlreadyLoaded` intenta evitar la carga multiple del archivo, pero mis tipos no cooperan... 🤔

> 👀 Hay que tomar en cuenta que una mejora inmediata sería usar la versión 6 del AI-SDK que está en beta y obtener datos estructurados desde un streamText:

```ts
const result = await streamText({
  model: openai("gpt-4.1"),
  prompt: "¿Cómo hago tamales mexicanos?",
  output: Output.object({
    schema: z.object({
      ingredients: z.array(z.string()),
      steps: z.array(z.string()),
    }),
  }),
});
```

Pero esto lo dejamos para otros ejercicios cuando estemos probando beta. 🤓

Por ahora, este es un ejemplo de cómo pasar un PDF:

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

Que lo disfrutes. Abrazo. bliss 🦾
