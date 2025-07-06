import { Scope, HttpException, HttpStatus, Controller, Get, Req, Post, Body, HttpCode, Header, Redirect, Query, Res, Next, Param, Headers, HttpRedirectResponse, HostParam } from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response, NextFunction } from 'express';
import { Observable, of } from 'rxjs';
import { IsString, IsInt } from 'class-validator';


interface DataResult {
  name: string;
  status: number;
  result?: any;
}

export class CreateCatDto {
  @IsString() name: string;
  @IsInt() age: number;
  @IsString() breed: string;
}



@Controller({
  path: 'test',
  scope: Scope.DEFAULT,
})
export class AppController {
  constructor(private readonly appService: AppService) {
  }


  @Get("a1")
  getHello(@Query() query: any): string {
    // console.log('Query parameters:', query);
    return this.appService.getHello();
  }



  @Post('a5')
  demo(@Body() createCatDto: CreateCatDto) {
    return createCatDto
  }

}



