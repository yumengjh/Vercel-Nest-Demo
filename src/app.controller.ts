import { Scope, HttpException, HttpStatus, Controller, Get, Req, Post, Body, HttpCode, Header, Redirect, Query, Res, Next, Param, Headers, HttpRedirectResponse, HostParam } from '@nestjs/common';
import { OnModuleInit } from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response, NextFunction } from 'express';
import { Observable, of } from 'rxjs';
import { IsString, IsInt } from 'class-validator';
import { SupabaseQueryService } from './databaseOperation';
import { HandleSupabaseQuery } from './decorators/supabase-handler.decorator';
import { Throttle, Debounce } from './decorators/throttle-debounce.decorator';
import { Type } from 'class-transformer';

// 定义配置项接口
interface AppConfig {
  id?: number;
  key?: string;
  value?: string;
  description?: string;
  created_at?: Date;
  updated_at?: Date;
}


@Controller({
  path: 'v1',
  scope: Scope.DEFAULT,
})
export class AppController implements OnModuleInit {
  private totalQuotesCount: number = 0;

  constructor(
    private readonly appService: AppService,
    private readonly supabaseQueryService: SupabaseQueryService,
  ) { }

  async onModuleInit() {
    await this.initQuotesCount();
  }

  private async initQuotesCount() {
    const result = await this.supabaseQueryService.executeSQL<AppConfig>(
      'SELECT * FROM motivational_quotes WHERE enable = true'
    );
    if (result?.data?.length > 0) {
      this.totalQuotesCount = result.data.length;
      console.log(`Initialized quotes count: ${this.totalQuotesCount}`);
    } else {
      console.log('No quotes available');
    }
  }

  @Get("a1")
  getHello(@Query() query: any): string {
    // console.log('Query parameters:', query);
    return this.appService.getHello();
  }



  @Get('quote')
  @HandleSupabaseQuery({
    successMessage: 'Get Success',
    errorMessage: 'Get Failed',
    defaultErrorStatus: HttpStatus.BAD_REQUEST
  })
  @Throttle({
    wait: 3000,
    errorMessage: 'Too Many Requests',
    errorStatus: HttpStatus.TOO_MANY_REQUESTS
  })
  async getRandomQuote(@Query('id') id: string) {
    if (this.totalQuotesCount === 0) {
      throw new HttpException('No quotes available', HttpStatus.NOT_FOUND);
    }
    const randomId = parseInt(id) || Math.floor(Math.random() * this.totalQuotesCount) + 1;
    return await this.supabaseQueryService.executeSQL<AppConfig>(
      `SELECT id, quote FROM motivational_quotes WHERE enable = true AND id = ${randomId}`
    );
  }


}



