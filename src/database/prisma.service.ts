import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get('DATABASE_URL'),
        },
      },
      log: configService.get('NODE_ENV') === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  }

  public async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('✅ Connected to PostgreSQL database');
    } catch (error) {
      this.logger.error('❌ Failed to connect to PostgreSQL database:', error);
      throw error;
    }
  }

  public async onModuleDestroy(): Promise<void> {
    try {
      await this.$disconnect();
      this.logger.log('🔌 Disconnected from PostgreSQL database');
    } catch (error) {
      this.logger.error('❌ Error disconnecting from database:', error);
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.error('Database health check failed:', error);
      return false;
    }
  }

  public async getConnectionInfo(): Promise<unknown> {
    try {
      const result = await this.$queryRaw`
        SELECT
          current_database() as database_name,
          current_user as current_user,
          version() as version,
          now() as current_time
      `;
      return result;
    } catch (error) {
      this.logger.error('Failed to get connection info:', error);
      throw error;
    }
  }
}
