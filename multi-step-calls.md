# Multi-Step Calls en AI SDK: Cuando tu IA Necesita Pensar en Varios Pasos

¿Alguna vez le has pedido algo a un asistente de IA y te has dado cuenta de que necesita buscar información antes de responderte? Por ejemplo, si preguntas "¿Qué ropa me recomendarías para el clima de hoy en Madrid?", la IA primero necesita saber qué clima hace en Madrid, y luego darte una recomendación.

Esto es exactamente lo que resuelven los **Multi-Step Calls** en Vercel AI SDK.

## ¿Qué son los Multi-Step Calls?

Los Multi-Step Calls permiten que un modelo de IA ejecute **varias generaciones de forma secuencial**. En lugar de responder todo de una vez, el modelo puede:

1. Reconocer que necesita información adicional
2. Llamar a una herramienta para obtenerla
3. Procesar el resultado
4. Continuar generando su respuesta (o llamar a otra herramienta si es necesario)

Es como cuando tú mismo buscas algo en Google antes de responder una pregunta: primero investigas, luego respondes.

## ¿Cómo funcionan?

Por defecto, `generateText` y `streamText` disparan una única generación. Pero cuando habilitas herramientas (tools), el modelo puede elegir entre:

- Generar texto directamente
- Invocar una herramienta

Con Multi-Step Calls, después de que una herramienta se ejecuta, el SDK **automáticamente** dispara una nueva generación pasándole el resultado. Este ciclo continúa hasta que:

- El modelo decide que ya tiene toda la información y genera texto final
- Se alcanza el límite de pasos que configuraste

## Ejemplo Práctico

Imaginemos que queremos crear un asistente que pueda consultar el clima:

```typescript
import { generateText, tool, stepCountIs } from 'ai';
import { z } from 'zod';
import { openai } from '@ai-sdk/openai';

const { text, steps } = await generateText({
  model: openai('gpt-4o'),
  tools: {
    weather: tool({
      description: 'Obtiene el clima de una ubicación',
      parameters: z.object({
        location: z.string().describe('La ciudad para consultar el clima'),
      }),
      execute: async ({ location }) => ({
        location,
        temperature: 22,
        condition: 'soleado',
      }),
    }),
  },
  stopWhen: stepCountIs(5), // Máximo 5 pasos
  prompt: '¿Qué clima hace en Barcelona y qué ropa me recomiendas?',
});

console.log(text);
```

### ¿Qué sucede internamente?

1. **Paso 1**: El modelo recibe el prompt y decide que necesita saber el clima. Llama a la herramienta `weather` con `location: "Barcelona"`.

2. **Paso 2**: El SDK ejecuta la herramienta y obtiene `{ location: "Barcelona", temperature: 22, condition: "soleado" }`. Esta información se pasa automáticamente al modelo.

3. **Paso 3**: El modelo ahora tiene la información del clima y genera una respuesta completa: "En Barcelona hace 22°C y está soleado. Te recomiendo ropa ligera, quizás una camiseta y pantalones cortos..."

## Accediendo a la Información de Cada Paso

El objeto `steps` que devuelve `generateText` contiene toda la información de cada paso intermedio:

```typescript
// Obtener todas las llamadas a herramientas
const allToolCalls = steps.flatMap(step => step.toolCalls);

// Ver qué pasó en cada paso
steps.forEach((step, index) => {
  console.log(`Paso ${index + 1}:`);
  console.log('- Herramientas llamadas:', step.toolCalls);
  console.log('- Resultados:', step.toolResults);
  console.log('- Texto generado:', step.text);
});
```

## Callbacks Útiles

### `onStepFinish`

Se ejecuta cuando cada paso termina. Perfecto para logging o actualizar una UI:

```typescript
const result = await generateText({
  model: openai('gpt-4o'),
  tools: { /* ... */ },
  stopWhen: stepCountIs(5),
  prompt: 'Tu pregunta aquí',
  onStepFinish: ({ text, toolCalls, toolResults, usage }) => {
    console.log('Paso completado');
    console.log('Tokens usados:', usage);

    if (toolCalls.length > 0) {
      console.log('Herramientas utilizadas:', toolCalls.map(tc => tc.toolName));
    }
  },
});
```

### `prepareStep`

Se llama **antes** de cada paso. Útil para modificar configuraciones dinámicamente:

```typescript
const result = await generateText({
  model: openai('gpt-4o'),
  tools: { /* ... */ },
  stopWhen: stepCountIs(5),
  prompt: 'Tu pregunta aquí',
  prepareStep: ({ previousSteps, stepNumber }) => {
    console.log(`Preparando paso ${stepNumber}`);

    // Puedes modificar configuraciones basándote en pasos anteriores
    if (stepNumber > 3) {
      return {
        toolChoice: 'none', // Forzar al modelo a responder sin más herramientas
      };
    }

    return {};
  },
});
```

## Configurando el Límite de Pasos

Es importante establecer un límite para evitar bucles infinitos o costos excesivos:

```typescript
import { stepCountIs } from 'ai';

// Máximo 5 pasos
stopWhen: stepCountIs(5)
```

También puedes crear condiciones personalizadas:

```typescript
// Detener cuando se haya llamado a una herramienta específica
stopWhen: ({ steps }) => {
  return steps.some(step =>
    step.toolCalls.some(tc => tc.toolName === 'finalAnswer')
  );
}
```

## Caso de Uso Real: Asistente de Viajes

Veamos un ejemplo más completo donde el asistente necesita consultar múltiples fuentes:

```typescript
import { generateText, tool, stepCountIs } from 'ai';
import { z } from 'zod';
import { openai } from '@ai-sdk/openai';

const { text } = await generateText({
  model: openai('gpt-4o'),
  tools: {
    getWeather: tool({
      description: 'Consulta el clima de una ciudad',
      parameters: z.object({
        city: z.string(),
      }),
      execute: async ({ city }) => {
        // Aquí irían llamadas reales a una API de clima
        return { city, temp: 25, condition: 'sunny' };
      },
    }),
    getFlightPrices: tool({
      description: 'Busca precios de vuelos',
      parameters: z.object({
        origin: z.string(),
        destination: z.string(),
        date: z.string(),
      }),
      execute: async ({ origin, destination, date }) => {
        // Aquí irían llamadas reales a una API de vuelos
        return {
          cheapest: 150,
          airline: 'Vueling',
          departure: '08:00'
        };
      },
    }),
    getHotelPrices: tool({
      description: 'Busca precios de hoteles',
      parameters: z.object({
        city: z.string(),
        checkIn: z.string(),
        checkOut: z.string(),
      }),
      execute: async ({ city, checkIn, checkOut }) => {
        return {
          cheapest: 80,
          hotel: 'Hotel Centro',
          rating: 4.2
        };
      },
    }),
  },
  stopWhen: stepCountIs(10),
  prompt: 'Quiero viajar de Madrid a Barcelona el 15 de enero. ¿Qué clima habrá y cuánto me costaría el viaje con vuelo y hotel por 2 noches?',
});

console.log(text);
```

En este ejemplo, el modelo probablemente:

1. Llamará a `getWeather` para Barcelona
2. Llamará a `getFlightPrices` para Madrid-Barcelona
3. Llamará a `getHotelPrices` para Barcelona
4. Generará una respuesta completa con toda la información

## Consejos para Principiantes

1. **Empieza simple**: Prueba primero con una sola herramienta antes de agregar más.

2. **Establece límites razonables**: Un `stepCountIs(5)` suele ser suficiente para la mayoría de casos.

3. **Usa `onStepFinish` para debugging**: Te ayudará a entender qué está haciendo el modelo en cada paso.

4. **Describe bien tus herramientas**: Una buena descripción ayuda al modelo a saber cuándo usarlas.

5. **Maneja errores en tus herramientas**: Si una herramienta falla, el modelo recibirá el error y puede intentar otra estrategia.

## Conclusión

Los Multi-Step Calls transforman a tu IA de un simple generador de texto a un **agente capaz de razonar y actuar**. Es la base para crear asistentes inteligentes que pueden investigar, comparar opciones y darte respuestas fundamentadas en datos reales.

La próxima vez que necesites que tu IA "piense antes de responder", ya sabes qué herramienta usar.

---

*¿Tienes preguntas sobre Multi-Step Calls? ¡Déjalas en los comentarios!*
