import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../database/redis.service';

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  environment: string;
  services: {
    database: 'connected' | 'disconnected' | 'unknown';
    redis: 'connected' | 'disconnected' | 'unknown';
  };
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly startTime = Date.now();

  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async getHealthStatus(): Promise<HealthStatus> {
    const status: HealthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: this.configService.get('npm_package_version', '1.0.0'),
      uptime: Date.now() - this.startTime,
      environment: this.configService.get('NODE_ENV', 'development'),
      services: {
        database: await this.checkDatabaseConnection(),
        redis: await this.checkRedisConnection(),
      },
    };

    // Determine overall health based on service status
    const hasUnhealthyServices = Object.values(status.services).some(
      (serviceStatus) => serviceStatus === 'disconnected',
    );

    if (hasUnhealthyServices) {
      status.status = 'unhealthy';
    }

    return status;
  }

  async getReadinessStatus(): Promise<{ ready: boolean; checks: any }> {
    const databaseStatus = await this.checkDatabaseConnection();
    const redisStatus = await this.checkRedisConnection();

    const checks = {
      database: databaseStatus === 'connected',
      redis: redisStatus === 'connected',
    };

    const ready = Object.values(checks).every(Boolean);

    return { ready, checks };
  }

  async getLivenessStatus(): Promise<{ alive: boolean }> {
    // Simple liveness check - if we can respond, we're alive
    return { alive: true };
  }

  private async checkDatabaseConnection(): Promise<'connected' | 'disconnected' | 'unknown'> {
    try {
      const isHealthy = await this.prismaService.healthCheck();
      return isHealthy ? 'connected' : 'disconnected';
    } catch (error) {
      this.logger.error('Database health check failed:', error);
      return 'disconnected';
    }
  }

  private async checkRedisConnection(): Promise<'connected' | 'disconnected' | 'unknown'> {
    try {
      const isHealthy = await this.redisService.healthCheck();
      return isHealthy ? 'connected' : 'disconnected';
    } catch (error) {
      this.logger.error('Redis health check failed:', error);
      return 'disconnected';
    }
  }
}
