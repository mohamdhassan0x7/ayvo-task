import { Body, Controller, Get, Post } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Post()
  checkWithBody(@Body() body: unknown) {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      received: body,
    };
  }
}
