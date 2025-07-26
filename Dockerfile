# Stage 1: Build the TypeScript server
FROM node:20-alpine AS builder
WORKDIR /app

# Install build tools for native modules
RUN apk add --no-cache python3 make g++

# Copy package definitions
COPY package*.json ./

# Install dependencies without running prepare/build
RUN npm ci --ignore-scripts
# Rebuild bcrypt (and any other native addons) from source
RUN npm rebuild bcrypt --build-from-source

# Copy tsconfig and source
COPY tsconfig.json ./tsconfig.json
COPY src ./src

# ⬇️ Copy public folder (important!)
COPY public ./public

# Now run the build
RUN npm run build

# Stage 2: Runtime image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy package.json
COPY package*.json ./

# Copy built code and prebuilt native modules
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# ⬇️ Copy public folder to include robots.txt and assets
COPY --from=builder /app/public ./public

# Expose application port
EXPOSE 5000

# Start the server
CMD ["node", "dist/server.js"]
