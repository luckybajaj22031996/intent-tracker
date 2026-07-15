# Intention Store Service — Dockerfile
# Base: official Node.js slim image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files first for layer caching
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy compiled source (build output)
COPY dist/ ./dist/

# Expose the assigned port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 8080) + '/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Accept port via env var; default to assigned port 8080
CMD ["sh", "-c", "node dist/index.js"]

# Environment defaults (production-safe)
ENV NODE_ENV=production
ENV PORT=8080
