import { Controller, Get, Req, Post, Body, HttpCode, Header, Redirect, Query, Res, Next, Param, Headers, HttpRedirectResponse } from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response, NextFunction } from 'express';

@Controller("cats")
export class AppController {
  constructor(private readonly appService: AppService) { }


  @Get("breed")
  getHello(@Query() query: any): string {
    console.log('Query parameters:', query);
    return this.appService.getHello();
  }

  @Get('page/:id')
  findOne(@Param() params: any): string {
    console.log(params.id);
    return `This action returns a #${params.id} cat`;
  }


  @Get('init')
  getInitInfo(@Req() request: Request) {
    return {
      status: '❤',
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

