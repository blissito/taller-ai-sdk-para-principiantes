# Ejercicio 01: Recibiendo streams con puro VanillaJS

En este ejercicio exploraremos el trabajo cliente/servidor que se requiere para recibir y manipular `streams` de manera nativa. 🍛

Para el backend usaremos la herramienta que Vercel ya nos provee: `pipeTextStreamToResponse` y para el cliente: el tradicional `TextDecoder()` usando el reader que ya viene en la respuesta. ✅

## Flujo de la aplicación

```
┌─────────────────────────────────────────────────────────┐
│                      SERVIDOR                           │
│   Express + pipeTextStreamToResponse                    │
└─────────────────────────────────────────────────────────┘
                          ↓
                    GET /api/chat
                          ↓
              Stream de bytes (chunks)
                          ↓
┌─────────────────────────────────────────────────────────┐
│                      CLIENTE                            │
│   fetch → reader.read() → TextDecoder → DOM             │
└─────────────────────────────────────────────────────────┘
```

## El cambio en la arquitectura

Tenemos una carpeta `public/` en la que colocaremos los archivos estáticos del cliente. En esta simplificación son solo dos:
`client.js` e `index.html`.

`index.html` solo aporta el markup básico y la referencia al pedacito de **JS** que se requiere:

```html
<h1>Blissmo Chat Stream Demo</h1>
<button id="start">Iniciar Stream</button>
<div id="output"></div>
<!--

  Toma nota cómo se consigue el archivo JS,
  solicitando el script en la raiz del sitio. 🤓
  Recuerda que este archivo es un estático. 🎼

-->
<script type="module" src="/client.js"></script>
```

Los archivos estáticos son provistos por:

```ts
app.use(express.static("public")); // home page
```

Esto garantiza que la carpeta `public` se sirve de manera estática. ✅

## Mientras que el backend se prepara en la ruta api/chat

Usamos la función chat de nuestro archivo `index.ts`, que es el origen de la inferencia. 🫆

```ts
app.get("/api/chat", (_, res) => {
  const result = chat("crea un poema sobre robots");
  result.pipeTextStreamToResponse(res); // aquí una función fancy del StreamTextResult 🎀
});
```

No hace falta una función asíncrona cuando hacemos pipe. ⚡️
Para responder al cliente usamos la utilidad para hacer pipe con `res` del **AI-SDK**.

| Método | Framework | Descripción |
|--------|-----------|-------------|
| `pipeTextStreamToResponse(res)` | Express | Pipe a response de Express |
| `toTextStreamResponse()` | Hono/Web | Retorna Response estándar |

## ¿Cómo consume el cliente este endpoint?

Si vamos a `client.js` veremos que hemos detectado el clic en el botón y que detonamos un loop infinito:

```ts
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  output.textContent += decoder.decode(value); // lo volvemos texto
}
```

Rompemos el loop si el _reader_ devuelve `done` junto con el `value`. 🤔 Pero, mientras `done` sea falso, seguiremos añadiendo el texto decodificado al nodo `#output`. 📝

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `done` | `boolean` | `true` cuando el stream termina |
| `value` | `Uint8Array` | Bytes del chunk actual |

### Código completo del cliente

```js
// public/client.js
const output = document.getElementById("output");
const button = document.getElementById("start");

async function startStream() {
  output.textContent = "";
  const response = await fetch("/api/chat");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    output.textContent += decoder.decode(value);
  }
}

button.addEventListener("click", startStream);
```

`response.body` es un `ReadableStream<Uint8Array>`. Usamos `.getReader()` para leerlo chunk por chunk.

## Estructura del proyecto

```
├── index.ts       # Función chat con streamText
├── server.ts      # Servidor Express
└── public/
    ├── index.html # Página con botón y output
    └── client.js  # Lógica de streaming
```

## Ejecución

```bash
npm install
npm run dev
# Abre http://localhost:3000
```

## Conclusión

En este ejercicio no nos preocupamos aún por enviar el prompt desde el cliente, ejecutamos uno pre-definido. Esto, para entender mejor cómo se hace a nivel plataforma. 🤓👩🏻‍💻

En el siguiente ejercicio nos encargaremos de añadir un formulario tipo chat, pero lo haremos ya con Vite y React. 💬⚛

## Lo que aprenderás

1. **pipeTextStreamToResponse** - Streaming con Express
2. **ReadableStream** - API nativa del navegador
3. **TextDecoder** - Convertir bytes a texto
4. **reader.read()** - Consumir stream chunk por chunk
5. **express.static** - Servir archivos estáticos

---

Que lo disfrutes. Abrazo. bliss 🤓
