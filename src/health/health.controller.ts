import { Controller, Get } from '@nestjs/common';
import { HealthService, HealthStatus } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  public async getHealth(): Promise<HealthStatus> {
    return this.healthService.getHealthStatus();
  }

  @Get('ready')
  public async getReadiness(): Promise<{ ready: boolean; checks: Record<string, boolean> }> {
    return this.healthService.getReadinessStatus();
  }

  @Get('live')
  public getLiveness(): { alive: boolean } {
    return this.healthService.getLivenessStatus();
  }
}
