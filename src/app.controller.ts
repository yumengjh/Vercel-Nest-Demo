import { Controller, Get, Req, Post, Body, HttpCode, Header, Redirect, Query, Res, Next, Param, Headers, HttpRedirectResponse, HostParam } from '@nestjs/common';
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


  @Get('a3')
  async getData(@Query("name") name: string): Promise<DataResult> {
    return new Promise(resolve => {
      setTimeout(() => resolve({
        name: name || 'Yumengjianghu',
        status: 1,
      }), 3000);
    });
  }


  @Get('a4')
  findAll(): Observable<any[]> {
    return of([
      { id: 1, name: '张三' },
      { id: 2, name: '李四' },
    ]);
  }

  @Post('a5')
  demo(@Body() createCatDto: CreateCatDto) {
    return createCatDto
  }

  @Get('a6')
  demo6(@Query('name') name: string, @Query('age') age: number) {
    return `你的姓名是${name}，年龄是${age}`
  }
}

