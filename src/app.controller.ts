import { Scope, HttpException, HttpStatus, Controller, Get, Req, Post, Body, HttpCode, Header, Redirect, Query, Res, Next, Param, Headers, HttpRedirectResponse, HostParam } from '@nestjs/common';
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
export class AppController {

  constructor(
    private readonly appService: AppService,
    private readonly supabaseQueryService: SupabaseQueryService,
  ) {
  }

  @Get("a1")
  getHello(@Query() query: any): string {
    // console.log('Query parameters:', query);
    return this.appService.getHello();
  }



  @Get('quote')
  @HandleSupabaseQuery({
    successMessage: '获取励志语录成功',
    errorMessage: '获取励志语录失败',
    defaultErrorStatus: HttpStatus.BAD_REQUEST
  })
  @Throttle({
    wait: 2000,
    errorMessage: '查询操作太频繁，请稍后再试',
    errorStatus: HttpStatus.TOO_MANY_REQUESTS
  })
  async getRandomQuote() {
    const randomId = Math.floor(Math.random() * 100) + 1;
    return await this.supabaseQueryService.executeSQL<AppConfig>(
      `SELECT id, quote FROM motivational_quotes WHERE enable = true AND id = ${randomId}`
    );
  }

  @Get('config')
  @Throttle({
    wait: 2000,
    errorMessage: '查询操作太频繁，请稍后再试',
    errorStatus: HttpStatus.TOO_MANY_REQUESTS
  })
  @HandleSupabaseQuery({
    successMessage: '获取配置成功',
    errorMessage: '获取配置失败',
    defaultErrorStatus: HttpStatus.BAD_REQUEST
  })
  async getAppConfig(@Query("key") key: string = 'default_key') {
    return await this.supabaseQueryService.executeSQL<AppConfig>(
      `SELECT * FROM app_config where key = '${key}' ORDER BY id ASC`
    );
  }

  @Get('insert')
  @HandleSupabaseQuery({
    successMessage: '操作成功',
    errorMessage: '操作失败',
    defaultErrorStatus: HttpStatus.BAD_REQUEST
  })
  async getFilteredConfig(@Query('key') key: string = 'default_key', @Query('value') value: string = 'default_value', @Query('description') description: string = 'default_description') {
    let sql = `INSERT INTO app_config (key, value, description) VALUES ('${key}', '${value}', '${description}')`;
    return await this.supabaseQueryService.executeSQL<AppConfig>(sql);
  }

  @Get('delete')
  @HandleSupabaseQuery({
    successMessage: '删除成功',
    errorMessage: '删除失败',
    defaultErrorStatus: HttpStatus.BAD_REQUEST
  })
  async getSpecificFields(@Query("key") key?: string, @Query("id") id?: number) {
    let sql: string;

    if (id) {
      sql = `DELETE FROM app_config WHERE id = ${id}`;
    } else if (key) {
      sql = `DELETE FROM app_config WHERE key = '${key}'`;
    } else {
      throw new HttpException('必须提供key或id参数', HttpStatus.BAD_REQUEST);
    }

    return await this.supabaseQueryService.executeSQL<AppConfig>(sql);
  }
}



