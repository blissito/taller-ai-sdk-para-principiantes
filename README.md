# Recibiendo streams con puro VanillaJS

En este ejercicio exploraremos el trabajo cliente/servidor que se requiere para recibir y manipular `streams` de manera nativa. 🍛

Para el backend usaremos la herramienta que Vercel ya nos provee: `pipeTextStreamToResponse` y para el cliente: el tradicional `TextDecoder()` usando el reader que ya viene en la respuesta. ✅

```ts
ReadableStreamDefaultReader<Uint8Array<ArrayBuffer>>;

const response = await fetch("/api/chat");
const reader = response.body.getReader();
```

## El cambio en la arquitectura

Tenemos una carpeta `public/` en la que colocaremos los archivos estáticos del cliente. En esta simplificación son solo dos:
`client.js` e `index.html`.

`index.html` solo aporta el markup básico y la referencia al pedacito de **JS** que se requiere:

```ts
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

Los archivos estaticos son provistos por:

```ts
app.use(express.static("public")); // home page
```

Esto garantiza que la carpeta `public` se sirve de manera estática. ✅

## Mientras que el backend se prepara en la ruta api/chat

Usamos la función chat de nuestro archivo `index.ts`, que es el origen de la inferencia. 🫆

```ts
app.get("/api/chat", (_, res) => {
  const result = chat("crea un poema sobre robots");
  result.pipeTextStreamToResponse(res); // aqui una función fancy del StreamTextResult 🎀
});
```

No hace falta una función asíncrona cuando hacemos pipe. ⚡️
Para responder al cliente usamos la utilidad para hacer pipe con `res` del **AI-SDK**.

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

## Conclusión

En este ejercicio no nos preocupamos aún por enviar el prompt desde el cliente, ejecutamos uno pre-definido. Esto, para entender mejor cómo se hace a nivel plataforma. 🤓👩🏻‍💻
En el siguiente ejercicio nos encargaremos de añadir un formulario tipo chat, pero lo haremos ya con Vite y React. 💬⚛
