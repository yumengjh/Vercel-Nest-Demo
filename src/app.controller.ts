import { Controller, Get, Req, Post, Body, HttpCode, Header, Redirect, Query, Res, Next, Param, Headers, HttpRedirectResponse } from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response, NextFunction } from 'express';

@Controller("test")
export class AppController {
  constructor(private readonly appService: AppService) { }


  @Get("a1")
  getHello(@Query() query: any): string {
    // console.log('Query parameters:', query);
    return this.appService.getHello();
  }

  @Get('a2/:id')
  findOne(@Param() params: any): string {
    console.log(params.id);
    return `This action returns a #${params.id} cat`;
  }


}

