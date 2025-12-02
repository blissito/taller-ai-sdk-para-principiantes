# Taller AI SDK para principiantes

Aprende a construir aplicaciones con IA usando el [Vercel AI SDK](https://ai-sdk.dev).

## Ejercicios

### Sábado 1: Fundamentos (3.5h)

| Actividad                        | Descripción                                      | Duración |
| -------------------------------- | ------------------------------------------------ | -------- |
| Introducción                     | Bienvenida, setup y conceptos de AI SDK          | 15 min   |
| `ejercicio/01-streaming-vanilla` | Streaming básico con Express + vanilla JS        | 50 min   |
| Descanso                         |                                                  | 10 min   |
| `ejercicio/02-react-usechat`     | Cliente React con useChat (AI SDK 5)             | 70 min   |
| Descanso                         |                                                  | 10 min   |
| `ejercicio/03-upload_context`    | Subida de archivos para contexto                 | 55 min   |

### Sábado 2: Avanzado (3.5h)

| Actividad                        | Descripción                                      | Duración |
| -------------------------------- | ------------------------------------------------ | -------- |
| Recap                            | Repaso del sábado anterior                       | 10 min   |
| `ejercicio/04-embeddings`        | Embeddings y búsqueda por similitud (RAG)        | 90 min   |
| Descanso                         |                                                  | 10 min   |
| `ejercicio/05-tools`             | Tools y UI generativa con componentes            | 70 min   |
| Q&A y cierre                     | Preguntas, recursos adicionales y despedida      | 30 min   |

**Duración total del taller: 7 horas (2 sábados)**

## Instalación

```bash
git clone https://github.com/blissito/taller-ai-sdk-para-principiantes.git
cd taller-ai-sdk-para-principiantes
git checkout ejercicio/01-streaming-vanilla  # o el ejercicio que quieras
npm install
cd client && npm install  # solo para ejercicio 02
```

## Configuración

Crea un archivo `.env` con tu API key de OpenAI:

```
OPENAI_API_KEY=tu-api-key
PORT=3000
```

## Ejecución

```bash
npm run dev
```

## Taller completo

[fixtergeek.com/ai-sdk](https://www.fixtergeek.com/ai-sdk)

## Autor

[blissito](https://github.com/blissito)
