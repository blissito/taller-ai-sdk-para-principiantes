# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copiar package.json de ambos proyectos
COPY package*.json ./
COPY client/package*.json ./client/

# Instalar dependencias
RUN npm ci && npm ci --prefix client

# Copiar código fuente
COPY . .

# Build del cliente y servidor
RUN npm run build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Usuario no-root por seguridad
RUN adduser --system --uid 1001 hono

# Copiar solo lo necesario para producción
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json .

# Asegurar que los archivos sean legibles por el usuario hono
RUN chmod -R o+r ./client/dist && chown -R 1001 ./client/dist

USER hono

EXPOSE 3000

CMD ["npm", "start"]
