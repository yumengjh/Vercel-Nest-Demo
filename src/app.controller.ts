import { Controller, Get, Req, Post, Body, HttpCode, Header, Redirect, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { Request } from 'express';

@Controller("cats")
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get("breed")
  getHello(@Query() query: any): string {
    console.log('Query parameters:', query);
    return this.appService.getHello();
  }

  @Get('breed/*')
  @HttpCode(204)
  @Header('Cache-Control', 'no-store')
  @Redirect('https://nest.nodejs.cn')
  create(): string {
    return 'This action adds a new cat';
  }

  @Get('docs')
  @Redirect('https://nest.nodejs.cn', 302)
  getDocs(@Query('version') version) {
    if (version && version === '5') {
      return { url: 'https://nest.nodejs.cn/v5/' };
    }
  }

  @Get('init')
  getInitInfo(@Req() request: Request) {
    return {
      status: 'ok',
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

