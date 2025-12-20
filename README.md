# Contexto en pedacitos vectorizados

Ahora vamos a no solo tomar un archivo, sino varios; muchos archivos que formarán parte del contexto pero con un sistema de pedacitos implementado, esto es una búsqueda por similitud dentro de una base de datos. 🔎📊

## Para crear esta experiencia vamos a necesitar que el servir cresca

Añadiremos 2 rutas nuevas al servidor:

```ts

"/api/embed" y

"/api/search"

```

Con `api/embed` vamos a recibir el contenido de un archivo para hacerlo pedacitos y guardarlo con todo y vectores que usaremos para búsqueda semántica. Y, con `api/search` haremos la búsqueda semántica y conseguiremos solo los _chunks_ adecuados. ✅

Antes de observar estas rutas a detalle, vamos a terminar de ver el cuerpo completo del app.

## En el cliente tenemos un par de funciones en el componente APP.ts

Que nos sirven para mandar el archivo a `api/embed` cuando el usuario lo seleccione, para ser procesado y hasta actualizamos su estado cuando ya está listo.

```ts
const handleFileChange = useCallback(
  async (e: React.ChangeEvent<HTMLInputElement>) => {
    //...
  },
  [sessionId]
);
```

WIP
