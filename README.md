# Visiobook Core Database Service

A centralized microservice designed to consolidate databases from multiple microservices with different technology stacks and ORMs. This service handles database extraction, schema consolidation, data migration, and eventual decommissioning of individual microservice databases.

## 🎯 Overview

The Visiobook Core Database Service addresses the challenge of managing databases across a diverse microservices ecosystem where teams use different technology stacks (NestJS/TS, Python/FastAPI, Go) with various ORMs (Prisma, SQLAlchemy, GORM). Upon delivery, microservice databases are extracted, integrated into this centralized service, and then decommissioned.

## 🏗️ Architecture

### Technology Stack
- **Runtime**: Node.js 18+ LTS
- **Language**: TypeScript 5.2+ (strict mode)
- **Framework**: NestJS 10+ (microservices architecture)
- **Primary ORM**: Prisma 5.6+ (schema introspection + type safety)
- **Database**: PostgreSQL 15+ (with extensions: uuid, pgcrypto, pgvector)
- **Cache**: Redis 7+ (connection pooling + sessions)
- **Testing**: Jest + Supertest + TestContainers
- **Monitoring**: Prometheus + Grafana

### Core Components
1. **ORM Adapter Engine** - Multi-ORM support for Prisma, SQLAlchemy, GORM
2. **Migration Engine** - Schema + data migration with conflict resolution
3. **Consolidation Engine** - Database merging and decommissioning
4. **API Layer** - REST + GraphQL endpoints
5. **Health Monitoring** - Comprehensive health checks and metrics

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ LTS
- Docker & Docker Compose (recommended)
- PostgreSQL 15+ (if not using Docker)
- Redis 7+ (if not using Docker)

### Installation

#### Option 1: Docker Compose (Recommended)

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd core-database-service
   npm install
   ```

2. **Start services with Docker**
   ```bash
   # Start PostgreSQL and Redis
   docker-compose up -d

   # Generate Prisma client
   npm run prisma:generate

   # Run database migrations
   npm run prisma:migrate

   # Start development server
   npm run start:dev
   ```

3. **Access services**
   - **API**: http://localhost:3000/api/v1
   - **Health Check**: http://localhost:3000/api/v1/health
   - **PostgreSQL**: localhost:5432 (user: postgres, password: password)
   - **Redis**: localhost:6379
   - **pgAdmin**: http://localhost:8080 (admin@visiobook.com / admin)

#### Option 2: Local Installation

1. **Prerequisites**
   - PostgreSQL 15+
   - Redis 7+

2. **Setup**
   ```bash
   git clone <repository-url>
   cd core-database-service
   npm install
   cp .env.example .env
   # Edit .env with your database and Redis configurations
   npm run prisma:generate
   npm run prisma:migrate
   npm run start:dev
   ```

#### Docker Commands

```bash
# Start all services
docker-compose up -d

# Start with pgAdmin for database management
docker-compose --profile tools up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Reset data (removes volumes)
docker-compose down -v
```

## 📋 Available Scripts

### Development
- `npm run start:dev` - Start development server with hot reload
- `npm run start:debug` - Start with debugging enabled
- `npm run build` - Build the application
- `npm run start:prod` - Start production server

### Database
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:deploy` - Deploy migrations to production
- `npm run prisma:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with initial data

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier

### Testing
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Run tests with coverage
- `npm run test:e2e` - Run end-to-end tests

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `REDIS_HOST` | Redis host | localhost |
| `REDIS_PORT` | Redis port | 6379 |
| `NODE_ENV` | Environment | development |
| `PORT` | Application port | 3000 |
| `LOG_LEVEL` | Logging level | debug |

### Database Configuration
```env
DATABASE_URL="postgresql://username:password@localhost:5432/visiobook_core_db?schema=public"
DB_MAX_CONNECTIONS=10
DB_CONNECTION_TIMEOUT=30000
```

### Redis Configuration
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

## 🏥 Health Checks

The service provides comprehensive health monitoring:

### Endpoints
- `GET /api/v1/health` - Overall health status
- `GET /api/v1/health/ready` - Readiness check
- `GET /api/v1/health/live` - Liveness check

### Health Response
```json
{
  "status": "healthy",
  "timestamp": "2024-01-20T10:30:00Z",
  "version": "1.0.0",
  "uptime": 123456,
  "environment": "development",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

## 🔄 Database Consolidation Process

### Phase 1: Development (Parallel Development)
- Microservices use local databases with preferred ORMs
- Database service provides schema registration and validation
- Teams develop independently without blocking dependencies

### Phase 2: Integration (Database Extraction)
- Schema extraction from existing microservice databases
- Data export with integrity validation
- Conflict detection and resolution planning

### Phase 3: Consolidation (Data Migration)
- Schema merging with conflict resolution
- Data transformation and migration
- Service reconfiguration to use database service APIs

### Phase 4: Decommissioning (Cleanup)
- Original database decommissioning
- Connection cleanup and resource reclamation
- Final validation and monitoring setup

## 🔌 API Endpoints

### Database Management
- `POST /api/v1/databases/register` - Register a database
- `GET /api/v1/databases` - List registered databases
- `GET /api/v1/databases/{serviceName}/schema` - Get database schema

### Consolidation Operations
- `POST /api/v1/consolidation/extract/{serviceName}` - Extract database
- `POST /api/v1/consolidation/plan` - Create consolidation plan
- `POST /api/v1/consolidation/execute/{planId}` - Execute consolidation

### Entity Operations
- `GET /api/v1/entities/{tableName}` - List entities
- `POST /api/v1/entities/{tableName}` - Create entity
- `PUT /api/v1/entities/{tableName}/{id}` - Update entity
- `DELETE /api/v1/entities/{tableName}/{id}` - Delete entity

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:cov
```

## 📊 Monitoring

### Metrics
- Database connection pool utilization
- Query execution times and throughput
- Migration progress and performance
- API response times and error rates

### Logging
- Structured JSON logging with Winston
- Correlation IDs for request tracing
- Database query logging in development
- Error tracking and alerting

## 🔒 Security

### Data Security
- Encryption at rest and in transit
- Connection string encryption
- Audit logging for all operations
- Input validation and sanitization

### Access Control
- Service-to-service authentication
- Role-based access control (RBAC)
- API rate limiting
- CORS configuration

## 🚢 Deployment

### Docker
```bash
# Build image
docker build -t core-database-service .

# Run container
docker run -p 3000:3000 --env-file .env core-database-service
```

### Production Considerations
- Use environment-specific configuration
- Enable production logging
- Configure proper database connections
- Set up monitoring and alerting
- Implement backup strategies

## 📚 Documentation

### Architecture Documentation
See `database-service-architecture-plan.md` for comprehensive architecture details, implementation timeline, and technical specifications.

### API Documentation
- Swagger/OpenAPI documentation available at `/api/v1/docs` (when implemented)
- GraphQL playground available at `/graphql` (when implemented)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Development Guidelines
- Follow TypeScript strict mode
- Use Prettier for code formatting
- Write comprehensive tests
- Update documentation for new features
- Follow conventional commit messages

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Check the documentation in `database-service-architecture-plan.md`
- Review health check endpoints for service status
- Check application logs for detailed error information
- Consult the troubleshooting section in the architecture documentation

## 🐳 Docker Troubleshooting

### Common Issues

**Redis Connection Error**
```bash
# Check if containers are running
docker-compose ps

# Restart services
docker-compose restart

# Check logs
docker-compose logs redis
```

**Database Connection Issues**
```bash
# Reset database
docker-compose down -v
docker-compose up -d postgres
npm run prisma:migrate
```

**Port Conflicts**
```bash
# Check what's using the ports
lsof -i :5432
lsof -i :6379
lsof -i :3000
```

---

**Status**: Phase 1 Implementation Complete ✅
- ✅ Core infrastructure setup
- ✅ Database and Redis connections via Docker
- ✅ Health monitoring
- ✅ Basic Prisma schema
- ✅ Docker Compose development environment
- 🚧 ORM adapters (Phase 2)
- 🚧 Migration engine (Phase 3)
- 🚧 API layer (Phase 4)
