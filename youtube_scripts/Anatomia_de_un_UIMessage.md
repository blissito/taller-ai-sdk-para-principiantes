# Anatomía de un UIMessage con React y el AI SDK

**Duración estimada:** 5-7 minutos
**Nivel:** Principiantes
**Estilo:** Profesional, ameno

---

## INTRO [0:00 - 1:00]

**[Directo a cámara - tono de "te voy a mostrar algo"]**

En el AI SDK existe un tipo que se llama UIMessage. Y este tipo es el que define la forma de cada mensaje en tu chat.

**[Código en pantalla]**

```typescript
interface UIMessage {
  id: string;
  role: "system" | "user" | "assistant";
  parts: UIMessagePart[];
  metadata?: unknown;
}
```

**[Directo a cámara]**

Cuatro propiedades. Eso es todo. Pero dentro de esas cuatro propiedades —especialmente en `parts`— está todo lo que necesitas para construir un chat profesional.

Hoy vamos a revisar cada una.

Soy Héctor Bliss, y esto es Fixtergeek.

**[INTRO BUMPER - 3 segundos]**

---

## LAS PROPIEDADES [1:00 - 2:15]

**[Código en pantalla - resaltando cada propiedad]**

```typescript
interface UIMessage {
  id: string; // ← 1
  role: "system" | "user" | "assistant"; // ← 2
  parts: UIMessagePart[]; // ← 3
  metadata?: unknown; // ← 4
}
```

**[Directo a cámara]**

Vamos propiedad por propiedad.

**`id`** es un string único. El SDK lo genera automáticamente, pero tú puedes usarlo para identificar mensajes específicos —por ejemplo, para actualizarlos o eliminarlos.

**[Código en pantalla]**

```typescript
// Ejemplo: encontrar un mensaje por ID
const mensaje = messages.find((m) => m.id === "msg_abc123");
```

**[Directo a cámara]**

**`role`** indica quién envió el mensaje. Solo hay tres opciones: `system` para instrucciones iniciales, `user` para lo que escribe el usuario, y `assistant` para las respuestas del modelo.

**[Código en pantalla]**

```typescript
// Cada mensaje tiene un rol claro
{ role: "system", ... }    // Instrucciones
{ role: "user", ... }      // El humano
{ role: "assistant", ... } // La IA
```

**[Directo a cámara]**

**`metadata`** es opcional. Aquí puedes guardar información extra: timestamps, el modelo que se usó, conteo de tokens, lo que necesites.

**[Código en pantalla]**

```typescript
metadata: {
  createdAt: "2025-01-07T10:30:00Z",
  model: "claude-sonnet-4-20250514",
  tokens: 847
}
```

**[Directo a cámara]**

Y la cuarta propiedad es **`parts`**. Esta es la más importante, y es donde vamos a pasar el resto del video.

---

## LAS PARTS [2:15 - 4:30]

**[Directo a cámara]**

`parts` es un array. Y cada elemento de ese array es una "parte" del mensaje.

¿Por qué un array y no simplemente un string con el texto? Porque un mensaje puede contener más que texto: puede tener razonamiento del modelo, llamadas a herramientas, archivos adjuntos, fuentes citadas.

**[Código en pantalla - ejemplo de un mensaje real]**

```typescript
// Un mensaje del asistente puede verse así:
{
  id: "msg_abc123",
  role: "assistant",
  parts: [
    { type: "reasoning", text: "Voy a buscar el clima..." },
    { type: "tool-getWeather", input: { city: "CDMX" }, output: { temp: 22 } },
    { type: "text", text: "El clima en CDMX es de 22°C" },
    { type: "source-url", url: "https://weather.com", title: "Weather.com" }
  ]
}
```

**[Directo a cámara]**

¿Ves? Un solo mensaje, cuatro partes diferentes. Razonamiento, una tool, texto, y una fuente. Todo en el mismo array.

Veamos cada tipo de part en detalle:

**[Código en pantalla - parte por parte]**

```typescript
// TextUIPart - El texto que ves
{
  type: 'text',
  text: 'El clima hoy es soleado',
  state: 'done'  // o 'streaming'
}
```

**[Directo a cámara]**

El TextPart tiene un estado: streaming o done. Esto te permite mostrar el cursor parpadeante mientras llega el texto.

**[Código en pantalla]**

```typescript
// ReasoningUIPart - El "pensamiento" del modelo
{
  type: 'reasoning',
  text: 'El usuario pregunta por clima, debo buscar datos actuales...',
  state: 'done'
}
```

**[Directo a cámara]**

El ReasoningPart es fascinante. Es cuando el modelo "piensa en voz alta". Claude y otros modelos pueden mostrarte su proceso de razonamiento antes de responder.

**[Código en pantalla - con énfasis]**

```typescript
// ToolUIPart - Aquí está el PODER
{
  type: 'tool-getWeather',        // ← Nombre específico de la tool
  toolCallId: 'call_xyz',
  state: 'output-available',      // El estado del ciclo
  input: { city: 'CDMX' },        // Lo que mandaste
  output: { temp: 22, sky: 'sunny' }  // Lo que regresó
}
```

**[Directo a cámara - énfasis]**

¡Mira esto! Las tool parts tienen estados:

- `input-streaming` — Los argumentos aún están llegando
- `input-available` — Ya puedes ejecutar la tool
- `output-available` — Tienes el resultado
- `output-error` — Algo falló

Esto es ORO para construir UIs. Puedes mostrar "Buscando clima..." mientras está en streaming, y luego el resultado cuando esté disponible.

**[Código en pantalla]**

```typescript
// FileUIPart - Para archivos adjuntos
{
  type: 'file',
  mediaType: 'image/png',
  filename: 'grafica.png',
  url: 'data:image/png;base64,...'
}

// SourceUIPart - Referencias y citas
{
  type: 'source-url',
  url: 'https://weather.com/cdmx',
  title: 'Pronóstico CDMX'
}
```

**[Directo a cámara]**

Y tenemos FilesParts para imágenes o documentos, y SourceParts cuando el modelo cita sus fuentes. Todo en el mismo mensaje.

---

## RENDERIZANDO PARTS EN REACT [4:30 - 5:45]

**[Código en pantalla]**

En la práctica, renderizar un UIMessage se ve así:

```tsx
function Message({ message }: { message: UIMessage }) {
  return (
    <div className={`message ${message.role}`}>
      {message.parts.map((part, i) => {
        // Texto normal
        if (part.type === "text") {
          return <p key={i}>{part.text}</p>;
        }

        // Razonamiento (colapsable)
        if (part.type === "reasoning") {
          return (
            <details key={i} className="reasoning">
              <summary>Ver razonamiento</summary>
              {part.text}
            </details>
          );
        }

        // Tool call
        if (part.type.startsWith("tool-")) {
          return (
            <div key={i} className="tool-call">
              {part.state === "input-streaming" && <Spinner />}
              {part.state === "output-available" && (
                <ToolResult data={part.output} />
              )}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
```

**[Directo a cámara]**

¿Ves la elegancia? Iteras sobre parts y renderizas según el tipo. El AI SDK te da la estructura, tú decides cómo mostrarla.

---

## RECAPITULANDO [5:45 - 6:30]

**[Código en pantalla - el tipo completo]**

```typescript
interface UIMessage {
  id: string;
  role: "system" | "user" | "assistant";
  parts: UIMessagePart[]; // ← TextPart, ReasoningPart, ToolPart, FilePart, SourcePart
  metadata?: unknown;
}
```

**[Directo a cámara]**

Entonces, un UIMessage tiene cuatro propiedades:

- **`id`** para identificar el mensaje
- **`role`** para saber quién lo envió
- **`metadata`** para información adicional
- **`parts`** —un array— con el contenido real

Y cada part tiene su propio **`type`** y su propio **`state`** durante el streaming.

**[Diagrama simple]**

```
UIMessage
  └── parts[]
        ├── { type: "text", state: "streaming" | "done" }
        ├── { type: "reasoning", state: "streaming" | "done" }
        ├── { type: "tool-xxx", state: "input-streaming" | "output-available" | ... }
        ├── { type: "file", mediaType, url }
        └── { type: "source-url", url, title }
```

**[Directo a cámara]**

Cuando renderizas un chat, iteras sobre el array de `parts` y decides qué componente mostrar según el `type`. Si es texto, lo muestras como párrafo. Si es una tool, muestras un estado de carga o el resultado. Si es un archivo, lo muestras como imagen o link de descarga.

Esa es la anatomía de un UIMessage.

---

## CIERRE [6:30 - 7:00]

**[Directo a cámara]**

Si quieres ver esto en acción con código real, tengo un curso completo de AI SDK donde construimos un chat desde cero. El link está en la descripción.

Nos vemos en el siguiente video.

**[OUTRO BUMPER]**

---

## NOTAS DE PRODUCCIÓN

- **B-ROLL sugerido:** Animaciones de código, diagramas de flujo, demos de chat funcionando
- **Código en pantalla:** Usar tema oscuro, resaltar líneas importantes con animación
- **Ritmo:** Mantener energía alta, pausas breves para que respire
- **Thumbnail:** "UIMessage" en grande + diagrama de anatomía tipo médico

---

## FUENTES

- [AI SDK UIMessage Reference](https://ai-sdk.dev/docs/reference/ai-sdk-core/ui-message)
- [AI SDK Chatbot Tool Usage](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-tool-usage)
- [AI SDK 5 Announcement](https://vercel.com/blog/ai-sdk-5)
- [useChat Hook Reference](https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat)
