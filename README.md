<p align="center">
  <img src="https://www.fixtergeek.com/logo.png" alt="Fixtergeek" width="200" />
</p>

<h1 align="center">Agent self-contained</h1>

<p align="center">
  <strong>Un widget de chat con IA, self-hosted y open source.</strong><br>
  Embebelo en cualquier sitio web con una sola linea de codigo.
</p>

<p align="center">
  <a href="#instalacion">Instalacion</a> •
  <a href="#embeber">Embeber</a> •
  <a href="#admin-panel">Admin Panel</a> •
  <a href="#arquitectura">Arquitectura</a>
</p>

---

## La Forma

Este proyecto nacio del deseo de tener un **chat con IA que puedas hospedar tu mismo**. Sin dependencias de terceros, sin limites artificiales, sin datos que no controlas.

La belleza esta en la simplicidad:

```
Tu sitio web                          Tu servidor
     │                                     │
     │  <script src="/embed.js">           │
     └────────────────────────────────────>│
                                           │
     ┌─────────────────────────────────────┤
     │         iframe /widget              │
     │    ┌─────────────────────┐          │
     │    │   Chat Interface    │          │
     │    │   (React + AI SDK)  │          │
     │    └─────────────────────┘          │
     │              │                      │
     │              │ X-Session-Token      │
     │              ▼                      │
     │         /api/chat ──────────────────┤──> OpenAI
     │                                     │
```

Un solo archivo JavaScript transforma cualquier pagina en un chat inteligente. El widget vive en un iframe seguro, con su propia sesion, su propio historial, su propia vida.

---

## Instalacion

```bash
# Clonar
git clone https://github.com/fixtergeek/ai_sdk_curso.git
cd ai_sdk_curso
git checkout admin

# Instalar
npm install
cd client && npm install && cd ..

# Configurar
cp .env.example .env
# Editar .env con tu OPENAI_API_KEY

# Desarrollar
npm run dev
```

El servidor inicia en `http://localhost:3000`. El panel de admin en `/admin`.

### ¿Prefieres que lo hagamos por ti?

Si no quieres lidiar con la instalacion o simplemente prefieres enfocarte en tu negocio, **los mismos creadores podemos configurarlo todo por ti**. Desde el deploy hasta la personalizacion.

Contactanos en [fixtergeek.com](https://fixtergeek.com) o escribe directamente a [@blissito](https://github.com/blissito).

---

## Embeber

Una vez desplegado, embeber el chat es trivial:

```html
<script src="https://tu-servidor.com/embed.js"></script>
```

Eso es todo. El widget aparece como una pestana lateral que:

- **Empuja** el contenido del sitio (no lo tapa)
- Se **redimensiona** arrastrando el borde
- Se **expande** a pantalla completa
- **Recuerda** el tamano preferido del usuario

### API JavaScript

```javascript
ChatWidget.open(); // Abrir el sidebar
ChatWidget.close(); // Cerrar
ChatWidget.expand(); // Pantalla completa
ChatWidget.toggle(); // Alternar abierto/cerrado
ChatWidget.getState(); // "closed" | "sidebar" | "expanded"
```

---

## Admin Panel

Accede a `/admin` con Basic Auth (configurable via `ADMIN_USER` y `ADMIN_PASS`).

### Dashboard

El corazon del panel. Visualiza en tiempo real:

| Metrica               | Descripcion                      |
| --------------------- | -------------------------------- |
| **Sesiones Activas**  | Conexiones abiertas ahora mismo  |
| **Mensajes Totales**  | Usuario vs Asistente, desglosado |
| **Costo Acumulado**   | En USD, calculado por modelo     |
| **Latencia Promedio** | Tiempo de respuesta del LLM      |

Todo segmentado por **dia** y por **origen** (dominio que embebe el widget).

### Configuracion

Control de acceso granular:

- **Modo Publico**: Cualquier sitio puede embeber (CORS \*)
- **Origenes Permitidos**: Lista blanca de dominios
  - Soporta subdominios automaticamente (`example.com` permite `app.example.com`)
  - Desde variables de entorno (inmutables)
  - Desde el panel (dinamicos, guardados en DB)

### Embeber

Generador de codigo de integracion. Copia, pega, listo.

### Entrenamiento

_(Proximamente)_ RAG con embeddings para contexto personalizado.

---

## Arquitectura

### El Flujo de una Conversacion

```
1. Usuario abre widget
   └── GET /widget
       └── Valida origen (publico/permitido/dev)
       └── Genera session token (UUID, 2h TTL)
       └── Inyecta token en HTML del iframe

2. Usuario envia mensaje
   └── POST /api/chat
       └── Valida session token
       └── Guarda mensaje en SQLite
       └── Stream respuesta desde OpenAI
       └── Guarda respuesta + usage

3. Admin consulta stats
   └── GET /api/admin/stats
       └── Basic Auth
       └── Agrega datos de sessions, messages, usage
```

### Stack

| Capa          | Tecnologia       | Por que                             |
| ------------- | ---------------- | ----------------------------------- |
| **Runtime**   | Node.js 20       | LTS, estable                        |
| **Framework** | Hono             | Ligero, tipado, compatible con edge |
| **AI**        | Vercel AI SDK    | Streaming nativo, multi-provider    |
| **Database**  | SQLite + Drizzle | Zero config, persistencia simple    |
| **Frontend**  | React 19 + Vite  | Moderno, rapido                     |
| **Deploy**    | Fly.io + Docker  | Auto-scale, volumes persistentes    |

### Base de Datos

Cuatro tablas, una responsabilidad cada una:

```
sessions        Tokens activos y su origen
chat_messages   Historial por sesion
usage_logs      Tokens, costos, latencia por request
config          Configuracion dinamica (public_access, allowed_origins)
```

SQLite con WAL (Write-Ahead Logging) permite lecturas concurrentes durante escrituras. Ideal para un chat.

### Estructura de Archivos

```
.
├── server.ts           # API + rutas + auth
├── index.ts            # Logica de inferencia (streamText)
├── db/
│   ├── index.ts        # Operaciones de base de datos
│   └── schema.ts       # Esquema Drizzle
├── client/
│   ├── src/
│   │   ├── Widget.tsx  # UI del chat (iframe)
│   │   └── embed.ts    # Script de embedding
│   └── dist/
│       ├── admin.html  # Panel de administracion
│       ├── embed.js    # Script compilado
│       └── index-widget.html
├── Dockerfile          # Multi-stage build
└── fly.toml            # Config Fly.io
```

---

## Self-Hosting

### Variables de Entorno

| Variable          | Requerida | Descripcion                                        |
| ----------------- | --------- | -------------------------------------------------- |
| `OPENAI_API_KEY`  | Si        | Tu API key de OpenAI                               |
| `ADMIN_USER`      | No        | Usuario del admin (default: `admin`)               |
| `ADMIN_PASS`      | No        | Password del admin (default: `admin123`)           |
| `ALLOWED_ORIGINS` | No        | Dominios permitidos, separados por coma            |
| `DATABASE_URL`    | No        | Path al archivo SQLite (default: `./data/chat.db`) |
| `PORT`            | No        | Puerto del servidor (default: `3000`)              |

### Deploy en Fly.io

```bash
# Instalar CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Crear app (primera vez)
fly launch

# Crear volumen para la base de datos
fly volumes create data --size 1

# Configurar secretos
fly secrets set OPENAI_API_KEY=sk-...
fly secrets set ADMIN_PASS=tu-password-seguro

# Deploy
fly deploy
```

Tu widget estara disponible en `https://tu-app.fly.dev`.

### Deploy con Docker

```bash
# Build
docker build -t chat-widget .

# Run
docker run -p 3000:3000 \
  -e OPENAI_API_KEY=sk-... \
  -e ADMIN_PASS=secreto \
  -v $(pwd)/data:/data \
  chat-widget
```

---

## Seguridad

El diseno prioriza la seguridad sin sacrificar usabilidad:

- **Sesiones efimeras**: Tokens UUID con TTL de 2 horas
- **Aislamiento**: Widget en iframe, sin acceso al DOM del host
- **CORS controlado**: Por defecto solo origenes permitidos
- **Auth basica**: Panel de admin protegido
- **Usuario no-root**: Container corre como `hono:1001`
- **HTTPS forzado**: En produccion, todo el trafico se redirige

---

## Filosofia

Este proyecto existe porque creemos que:

1. **Tus datos son tuyos**. El historial de chat, los costos, las metricas—todo vive en tu servidor.

2. **La simplicidad es poder**. Una linea de codigo para embeber. Un archivo SQLite para persistir. Un Dockerfile para deployar.

3. **Open source importa**. Puedes leer cada linea, modificar cada comportamiento, hospedar donde quieras.

El codigo esta escrito para ser leido. Las decisiones arquitectonicas estan documentadas en los comentarios. Si algo no tiene sentido, probablemente es un bug—abre un issue.

---

## Creditos

Construido por [@blissito](https://github.com/blissito) para [@fixtergeek](https://fixtergeek.com).

Basado en el [AI SDK Workshop](https://fixtergeek.com/ai-sdk)—un taller practico para dominar el Vercel AI SDK.

---

<p align="center">
  <sub>Si este proyecto te es util, considera darle una estrella.</sub>
</p>
