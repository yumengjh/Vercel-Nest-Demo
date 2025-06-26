import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('init')
export class InitController {
  @Get()
  getInitInfo(@Req() request: Request & { ip: string; headers: any }) {
    return {
      status: 'Successful startup',
      env: process.env.NODE_ENV || 'unknown',
      vercel: !!process.env.VERCEL,
      ip: request.ip,
      'x-forwarded-for': request.headers['x-forwarded-for'] || null,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }
}
