# Stage 1: Build the TypeScript server
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package definitions and install dependencies
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

# Copy only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built artifacts from the builder stage
COPY --from=builder /app/dist ./dist

# Expose application port
EXPOSE 5000

# Start the server
CMD ["node", "dist/server.js"]
