# Build frontend + run Node backend (serves /dist + /api + /ws)

FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install only production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Server + built frontend
COPY server ./server
COPY --from=build /app/dist ./dist

# Database lives in /app/cybersecurity.db (use a volume in Docker Compose)
EXPOSE 3001

CMD ["node", "server/index.js"]
