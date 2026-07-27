import { Controller, Get, UseGuards, UseInterceptors, Injectable, ExecutionContext } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';

@Injectable()
class TenantCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const req = context.switchToHttp().getRequest();
    if (!req.user) return req.url;
    return `${req.url}-${req.user.companyId}-${req.user.userId}`;
  }
}

@Controller('stats')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(TenantCacheInterceptor) 
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('dashboard')
  @Roles('super_admin')
  async getDashboardStats() {
    return this.statsService.getDashboardStats();
  }
}