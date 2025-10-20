# /The-Human-Tech-Blog-Server/Dockerfile
# Use Google's mirror to avoid Docker Hub 503s
# Alternatives if needed:
#   - mirror.gcr.io/library/node:20-bookworm-slim
#   - docker.io/library/node:20-alpine (se o mirror estiver indisponível)

# ---- Stage 1: Build the TypeScript server ----
FROM mirror.gcr.io/library/node:20-alpine AS builder
WORKDIR /app

# Install build tools for native modules (e.g., bcrypt)
RUN apk add --no-cache python3 make g++

# Copy package manifests first for better cache
COPY package*.json ./

# Install deps (no scripts to avoid running postinstall prematurely)
# Extra flags: faster & quieter CI-friendly
RUN npm ci --ignore-scripts --no-audit --no-fund

# Rebuild bcrypt (and any other native addons) from source against alpine
RUN npm rebuild bcrypt --build-from-source

# Copy project files
COPY tsconfig.json ./tsconfig.json
COPY src ./src
# Include public assets (robots.txt, etc.)
COPY public ./public

# Build TS -> dist
RUN npm run build

# ---- Stage 2: Runtime image ----
FROM mirror.gcr.io/library/node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy only what's necessary to run
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Healthcheck (ajusta o path quando quiseres)
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||5000)+'/api/csrf').catch(()=>process.exit(1))"

EXPOSE 5000

CMD ["node", "dist/server.js"]
