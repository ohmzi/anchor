import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      app: 'anchor',
      version: process.env.npm_package_version,
      timestamp: new Date().toISOString(),
    };
  }
}