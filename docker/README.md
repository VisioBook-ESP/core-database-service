# Docker Configuration for Visiobook Core Database Service

This directory contains all Docker-related configuration files for the Visiobook Core Database Service.

## 📁 Files Overview

- **`Dockerfile`** - Multi-stage production Docker image
- **`.dockerignore`** - Files excluded from Docker build context
- **`build.sh`** - Automated build script with proper tagging
- **`docker-compose.yml`** - Development environment services
- **`docker-compose.override.yml`** - Development-specific overrides

## 🚀 Quick Start

### Build the Production Image

```bash
# From project root
npm run docker:build

# Or directly from docker directory
cd docker && ./build.sh
```

### Run Development Environment

```bash
# Start all services (PostgreSQL, Redis, pgAdmin)
npm run docker:up

# View logs
npm run docker:logs

# Stop services
npm run docker:down

# Clean up (remove volumes)
npm run docker:clean
```

## 🐳 Docker Image Details

### Multi-Stage Build

The Dockerfile uses a multi-stage build approach:

1. **Builder Stage** (Node 20 Alpine)
   - Installs build dependencies
   - Compiles TypeScript
   - Generates Prisma client
   - Removes dev dependencies

2. **Production Stage** (Node 20 Alpine)
   - Minimal runtime image
   - Non-root user for security
   - Health checks integrated
   - Signal handling with dumb-init

### Image Tags

The build script creates multiple tags:
- `visiobook/core-database-service:latest`
- `visiobook/core-database-service:1.0.0`
- `visiobook/core-database-service:1.0.0-{git-commit}`

### Security Features

- ✅ Non-root user (`nestjs:nodejs`)
- ✅ Minimal Alpine Linux base
- ✅ Security updates applied
- ✅ Proper signal handling
- ✅ Health check integration

## 🔧 Configuration

### Environment Variables

The container expects these environment variables:

```bash
# Database Configuration
DATABASE_URL=postgresql://user:password@host:port/database
REDIS_URL=redis://host:port

# Application Configuration
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# Optional: Monitoring
PROMETHEUS_ENABLED=true
HEALTH_CHECK_TIMEOUT=10000
```

### Health Checks

The Docker image includes built-in health checks:

- **Endpoint**: `GET /api/v1/health/live`
- **Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Start Period**: 60 seconds
- **Retries**: 3

## 🏃‍♂️ Running the Container

### Basic Run

```bash
docker run -p 3000:3000 \
  --env-file .env \
  visiobook/core-database-service:latest
```

### With External Database

```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e REDIS_URL="redis://redis-host:6379" \
  visiobook/core-database-service:latest
```

### Development with Docker Compose

```bash
# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View application logs
docker-compose logs -f core-database-service

# Execute commands in running container
docker-compose exec core-database-service sh
```

## 📊 Monitoring

### Container Health

```bash
# Check health status
docker inspect --format='{{.State.Health.Status}}' container_name

# View health check logs
docker inspect --format='{{range .State.Health.Log}}{{.Output}}{{end}}' container_name
```

### Resource Usage

```bash
# Monitor resource usage
docker stats visiobook/core-database-service

# View container processes
docker exec container_name ps aux
```

## 🔍 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear Docker cache
   docker builder prune -a

   # Rebuild without cache
   docker build --no-cache -f Dockerfile -t visiobook/core-database-service:latest ../
   ```

2. **Permission Issues**
   ```bash
   # Check file ownership in container
   docker exec container_name ls -la /app

   # Verify user context
   docker exec container_name whoami
   ```

3. **Database Connection Issues**
   ```bash
   # Test database connectivity
   docker exec container_name node -e "
     const { PrismaClient } = require('@prisma/client');
     const prisma = new PrismaClient();
     prisma.\$connect().then(() => console.log('Connected')).catch(console.error);
   "
   ```

### Debug Mode

```bash
# Run container in debug mode
docker run -it --rm \
  --env-file .env \
  visiobook/core-database-service:latest \
  sh

# Override entrypoint for debugging
docker run -it --rm \
  --entrypoint sh \
  visiobook/core-database-service:latest
```

## 🚀 Production Deployment

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: core-database-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: core-database-service
  template:
    metadata:
      labels:
        app: core-database-service
    spec:
      containers:
      - name: core-database-service
        image: visiobook/core-database-service:1.0.0
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: url
        livenessProbe:
          httpGet:
            path: /api/v1/health/live
            port: 3000
          initialDelaySeconds: 60
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /api/v1/health/ready
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
```

### Docker Swarm

```yaml
version: '3.8'
services:
  core-database-service:
    image: visiobook/core-database-service:1.0.0
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL_FILE=/run/secrets/database_url
      - REDIS_URL_FILE=/run/secrets/redis_url
    secrets:
      - database_url
      - redis_url
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3

secrets:
  database_url:
    external: true
  redis_url:
    external: true
```

## 📈 Performance Optimization

### Image Size Optimization

- Multi-stage build reduces final image size
- Alpine Linux base (minimal footprint)
- Production dependencies only
- Optimized layer caching

### Runtime Optimization

- Non-blocking I/O with Node.js
- Connection pooling for database
- Redis caching layer
- Proper signal handling

## 🔐 Security Best Practices

- ✅ Non-root user execution
- ✅ Minimal attack surface (Alpine)
- ✅ No sensitive data in image
- ✅ Regular security updates
- ✅ Proper secret management
- ✅ Network isolation ready

## 📚 Additional Resources

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Node.js Docker Guide](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [Alpine Linux Security](https://alpinelinux.org/about/)
- [Kubernetes Deployment Guide](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
