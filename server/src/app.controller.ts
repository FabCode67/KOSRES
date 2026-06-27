import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Health check endpoint used by Railway to verify the app is running
  @Get('health')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString(), service: 'KOSRES API' };
  }
}
