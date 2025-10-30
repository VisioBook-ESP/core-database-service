# Visiobook Core Database Service - Production Dockerfile
# Multi-stage build for optimal production image

# ================================
# Build Stage
# ================================
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install system dependencies for native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    openssl \
    && rm -rf /var/cache/apk/*

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY .swcrc ./

# Install all dependencies (including devDependencies for build)
RUN npm ci --only=production=false

# Copy source code
COPY src/ ./src/
COPY prisma/ ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript to JavaScript
RUN npm run build

# Remove devDependencies to reduce size
RUN npm prune --production

# ================================
# Production Stage
# ================================
FROM node:20-alpine AS production

# Install security updates and required packages
RUN apk update && apk upgrade && \
    apk add --no-cache \
    dumb-init \
    openssl \
    && rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Set working directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma

# Copy scripts for database operations
COPY --chown=nestjs:nodejs scripts/ ./scripts/

# Create logs directory
RUN mkdir -p /app/logs && chown nestjs:nodejs /app/logs

# Switch to non-root user
USER nestjs

# Expose application port
EXPOSE 3000

# Health check using our health endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/v1/health/live', (res) => { \
        process.exit(res.statusCode === 200 ? 0 : 1) \
    }).on('error', () => process.exit(1))"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/main.js"]

# Metadata labels
LABEL maintainer="Visiobook Team <dev@visiobook.com>"
LABEL version="1.0.0"
LABEL description="Visiobook Core Database Service - Centralized database consolidation microservice"
LABEL org.opencontainers.image.source="https://github.com/VisioBook-ESP/core-database-service"
LABEL org.opencontainers.image.documentation="https://github.com/VisioBook-ESP/core-database-service/blob/main/README.md"
