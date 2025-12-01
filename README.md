# Trabajando con RAG Primera parte

Para conseguir que nuestro agente inteligente robótico pueda responder a las preguntas del usuario de una manera útil e informada, necesitaremos colocar en su contexto toda la info de nuestra marca o del tema requerido en el formato que prefiramos.

En esta primera parte del ejecicio, dividiremos un texto grande, que hable de nuestra marca. Y eso, lo vamos a conseguir utilizando Cluade Code o Gemini CLI.

```javascript
Vamos a recopilar info para darsela a un agente
 para el ejemplo del ejercicio 3 del curso:
https://www.fixtergeek.com/ai-sdk
este es mi sitio web: https://www.fixtergeek.com/
Vamos a usar este ejercicio, de paso, para auditar
la info de fixtergeek.com y, así luego,
alcanzar la forma mínima según las
recomendaciones de GEO o lo que sea que la comunidad esté usando para referirse a la optimización de busqueda en sistemas agénticos.
```

De esta manera orientamos perfectamente el resultado que buscamos. 🧠

> 👀 Si usas Claude Code, de preferencia, hazlo en modo plan.

Así es como yo le pido a Opus 4.5, que es el modelo que Claude me ha estado prestando; y funciona de maravilla, una cosa bella. ✅

Vamos a poner esta información en un archivo aparte para crear un sistema RAG completo, incluyendo la importación de archivos vía React. 😎

## Herramientas usadas en este ejemplo

Instalado en esta branch encontrarás a streamdown.ai lo usamos para renderizar correctamente el markdown natural de la respuesta del LLM. 🤩
