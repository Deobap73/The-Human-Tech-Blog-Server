 # Stage 1: Build the TypeScript server
 FROM node:20-alpine AS builder
 WORKDIR /app

# Install build tools for native modules
RUN apk add --no-cache python3 make g++

 # Copy package definitions and install dependencies (including dev for build)
 COPY package*.json ./

RUN npm ci

 # Copy tsconfig and source
 COPY tsconfig.json ./tsconfig.json
 COPY src ./src

 # Build the project into /app/dist
 RUN npm run build

 # Stage 2: Runtime image
 FROM node:20-alpine AS runner
 WORKDIR /app
 ENV NODE_ENV=production


# Copy package.json, built code, and prebuilt modules
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

 # Expose application port
 EXPOSE 5000

 # Start the server
 CMD ["node", "dist/server.js"]
