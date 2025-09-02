# Core Database Service Helm Chart

This Helm chart deploys the Visiobook Core Database Service with comprehensive
Istio service mesh integration, supporting both development and production
environments.

## Overview

The Core Database Service is a centralized microservice designed to consolidate
database operations across the Visiobook ecosystem. It provides a unified
interface for database interactions while supporting multiple ORM integrations
(Prisma, SQLAlchemy, GORM).

## Prerequisites

- Kubernetes 1.20+
- Helm 3.8+
- Istio 1.15+ (service mesh)
- PostgreSQL 15+ (database)
- Redis 7+ (cache)

## Installation

### Development Environment

```bash
# Install with default development values
helm install core-database-service ./helm

# Or specify the namespace
helm install core-database-service ./helm -n microservices --create-namespace
```

### Production Environment

```bash
# Install with production values
helm install core-database-service ./helm -f ./helm/values-prod.yaml -n microservices

# With custom values override
helm install core-database-service ./helm \
  -f ./helm/values-prod.yaml \
  --set image.tag=v1.2.3 \
  --set database.existingSecret=core-database-secret \
  -n microservices
```

## Configuration

### Environment-Specific Values

The chart includes two main configuration files:

- `values.yaml` - Development environment defaults
- `values-prod.yaml` - Production environment overrides

### Key Configuration Sections

#### Application Settings

```yaml
app:
  nodeEnv: production
  logLevel: error
  port: 3000
  apiPrefix: '/api/v1'
```

#### Database Configuration

```yaml
database:
  # Use existing secret (recommended for production)
  existingSecret: 'core-database-secret'

  # Or direct configuration (development only)
  host: 'postgres-cluster.database.svc.cluster.local'
  port: 5432
  name: 'visiobook_prod'
  maxConnections: 50
  connectionTimeout: 10000
```

#### Redis Configuration

```yaml
redis:
  host: 'redis-cluster.cache.svc.cluster.local'
  port: 6379
  database: 0
  password: '' # Use secret for production
  maxRetriesPerRequest: 3
```

#### Istio Service Mesh

```yaml
istio:
  enabled: true

  # Virtual Service for traffic routing
  virtualService:
    enabled: true
    hosts:
      - 'core-database-service.visiobook.com'
    gateways:
      - 'istio-system/gateway'

  # Destination Rule for load balancing and circuit breaking
  destinationRule:
    enabled: true
    trafficPolicy:
      loadBalancer:
        simple: LEAST_CONN
      circuitBreaker:
        consecutiveErrors: 3
        interval: 30s

  # mTLS Configuration
  peerAuthentication:
    enabled: true
    mode: STRICT # PERMISSIVE for dev, STRICT for prod

  # Access Control
  authorizationPolicy:
    enabled: true
    rules:
      - from:
          - source:
              principals:
                - 'cluster.local/ns/default/sa/api-gateway'
                - 'cluster.local/ns/microservices/sa/user-service'
```

#### Production Features

```yaml
# Horizontal Pod Autoscaler
autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
  targetMemoryUtilizationPercentage: 80

# Pod Disruption Budget
podDisruptionBudget:
  enabled: true
  minAvailable: 2

# Network Policies
networkPolicy:
  enabled: true
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: istio-system
        - namespaceSelector:
            matchLabels:
              name: microservices
      ports:
        - protocol: TCP
          port: 3000
```

## Secrets Management

### Database Credentials

Create a secret for database credentials:

```bash
kubectl create secret generic core-database-secret \
  --from-literal=username=dbuser \
  --from-literal=password=dbpassword \
  -n microservices
```

### Redis Credentials (if required)

```bash
kubectl create secret generic redis-secret \
  --from-literal=password=redispassword \
  -n microservices
```

## Deployment Commands

### Upgrade Deployment

```bash
# Upgrade with new image version
helm upgrade core-database-service ./helm \
  -f ./helm/values-prod.yaml \
  --set image.tag=v1.3.0 \
  -n microservices

# Upgrade with configuration changes
helm upgrade core-database-service ./helm \
  -f ./helm/values-prod.yaml \
  -f custom-values.yaml \
  -n microservices
```

### Rollback Deployment

```bash
# List release history
helm history core-database-service -n microservices

# Rollback to previous version
helm rollback core-database-service -n microservices

# Rollback to specific revision
helm rollback core-database-service 2 -n microservices
```

### Uninstall

```bash
helm uninstall core-database-service -n microservices
```

## Monitoring and Observability

### Health Checks

The service exposes the following health check endpoints:

- `/api/v1/health/live` - Liveness probe
- `/api/v1/health/ready` - Readiness probe
- `/api/v1/health` - General health status

### Metrics

Prometheus metrics are exposed at `/metrics` endpoint when monitoring is
enabled:

```yaml
monitoring:
  enabled: true
  prometheus:
    scrape: true
    port: '3000'
    path: '/metrics'
```

### Logging

Structured logging configuration:

```yaml
# Development
app:
  logLevel: debug

# Production
app:
  logLevel: error
configMap:
  data:
    logging.format: json
    logging.level: error
```

## Istio Integration

### Service Mesh Features

1. **Traffic Management**
   - Intelligent load balancing
   - Circuit breaker patterns
   - Retry policies
   - Timeout configurations

2. **Security**
   - Mutual TLS (mTLS) encryption
   - Authorization policies
   - Network policies

3. **Observability**
   - Distributed tracing
   - Service metrics
   - Access logs

### Gateway Configuration

Ensure your Istio Gateway is configured to route traffic:

```yaml
apiVersion: networking.istio.io/v1beta1
kind: Gateway
metadata:
  name: gateway
  namespace: istio-system
spec:
  selector:
    istio: ingressgateway
  servers:
    - port:
        number: 443
        name: https
        protocol: HTTPS
      tls:
        mode: SIMPLE
        credentialName: visiobook-tls
      hosts:
        - 'core-database-service.visiobook.com'
```

## Troubleshooting

### Common Issues

1. **Pod Startup Issues**

   ```bash
   # Check pod logs
   kubectl logs -l app.kubernetes.io/name=core-database-service -n microservices

   # Check pod events
   kubectl describe pod -l app.kubernetes.io/name=core-database-service -n microservices
   ```

2. **Database Connection Issues**

   ```bash
   # Verify database secret
   kubectl get secret core-database-secret -n microservices -o yaml

   # Test database connectivity
   kubectl exec -it deployment/core-database-service -n microservices -- \
     sh -c 'nc -zv $DATABASE_HOST $DATABASE_PORT'
   ```

3. **Istio Configuration Issues**

   ```bash
   # Check Istio proxy status
   kubectl exec -it deployment/core-database-service -n microservices -c istio-proxy -- \
     pilot-agent request GET stats/config_dump

   # Verify mTLS configuration
   istioctl authn tls-check core-database-service.microservices.svc.cluster.local
   ```

### Validation Commands

```bash
# Validate Helm chart
helm lint ./helm
helm lint ./helm -f ./helm/values-prod.yaml

# Dry run deployment
helm template core-database-service ./helm --dry-run
helm template core-database-service ./helm -f ./helm/values-prod.yaml --dry-run

# Check service mesh configuration
istioctl analyze -n microservices

# Verify network policies
kubectl describe networkpolicy core-database-service -n microservices
```

## Development

### Local Testing

```bash
# Install development environment
helm install core-database-service-dev ./helm \
  --set image.tag=latest \
  --set database.url="postgresql://localhost:5432/visiobook_dev" \
  -n microservices-dev --create-namespace

# Port forward for local access
kubectl port-forward svc/core-database-service 3000:3000 -n microservices-dev
```

### Chart Development

```bash
# Validate chart syntax
helm lint ./helm

# Test template rendering
helm template test ./helm --debug

# Package chart
helm package ./helm

# Generate documentation
helm-docs ./helm
```

## Security Considerations

1. **Secrets Management**: Always use Kubernetes secrets for sensitive data
2. **Network Policies**: Enable network policies in production
3. **mTLS**: Use STRICT mode for production environments
4. **RBAC**: Configure appropriate service account permissions
5. **Image Security**: Use specific image tags and scan for vulnerabilities
6. **Resource Limits**: Set appropriate CPU and memory limits

## Support

For issues and questions:

1. Check the troubleshooting section above
2. Review Kubernetes and Istio logs
3. Consult the Visiobook Core Database Service documentation
4. Contact the platform team for infrastructure-related issues

## Version Compatibility

| Chart Version | App Version | Kubernetes | Istio | Helm |
| ------------- | ----------- | ---------- | ----- | ---- |
| 1.0.0         | 1.0.0       | 1.20+      | 1.15+ | 3.8+ |

## Changelog

### v1.0.0

- Initial release
- Full Istio service mesh integration
- Development and production environment support
- Comprehensive security and monitoring features
