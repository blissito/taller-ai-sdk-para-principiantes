# Generando streams desde una inferencia básica

Pedirle algo al LLM es crear/generar/detonar una inferencia. ✅

```ts
import { streamText } from "ai";

const chat = (prompt: string) =>
  streamText({
    model,
    system,
    prompt,
  });
```

Creamos la función chat para poder recibir el prompt desde fuera. 🤓
Los streams son la manera más moderna y adoptada por la industria web para crear la mejor experiencia de chat con robots. 🤖

## ¿Cómo ejecutamos este script?

Vamos a ejecutar nuestro programa y recorrer el stream para devolver parte por parte a la consola.

```ts
const { textStream } = chat("Díme un poema robótico");

for await (const part of textStream) {
  process.stdout.write(part);
}
```

Ejecutamos el programa con: `npm run dev` que a su vez hace, simplemente: `tsx index.ts`. `tsx` es la manera más fácil de ejecutar TypeScript en Node.js. ✅

## El entorno web

No siempre queremos ejecutar scripts desde nuestra terminal, a veces se apetece crearnos una interfaz web, para ello usaremos el framework para crear un servidor más famoso de Node.js: express.js. ✅ Todo esto, en el siguiente ejercicio. 🧑🏻‍💻

> 👀 Hoy en día es más recomendable usar Hono que es compatible con multiples runtimes no solo Node.js. Además de ser mucho más rápido y usar patterns más modernos y apegados a la programación funcional. 👍🏼 Hay una branch bonus en la que usamos un servidor Hono en vez de express. `origin/ejercicio/bonus-migrate_to_hono`. ⬅️

Pero, si aún te sientes principiante y quieres ir más despacio, siempre puedes quedarte con express y sentirte más cómodo(a) mientras vas aprendiendo más. 😬
