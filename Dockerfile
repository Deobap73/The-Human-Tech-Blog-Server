# Stage 1: Build the TypeScript server
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package definitions and install dependencies (including dev for build), skipping scripts so prepare/build won’t run yet
COPY package*.json ./
RUN npm ci --ignore-scripts

# Copy tsconfig and source
COPY tsconfig.json ./tsconfig.json
COPY src ./src

# Now build the project into /app/dist
RUN npm run build

# Stage 2: Runtime image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy package definitions
COPY package*.json ./
# Install production dependencies and skip lifecycle scripts (prepare)
RUN npm ci --omit=dev --ignore-scripts

# Copy built artifacts from the builder stage
COPY --from=builder /app/dist ./dist

# Expose application port
EXPOSE 5000

# Start the server
CMD ["node", "dist/server.js"]
