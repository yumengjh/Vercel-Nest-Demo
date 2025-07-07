import { Scope, HttpException, HttpStatus, Controller, Get, Req, Post, Body, HttpCode, Header, Redirect, Query, Res, Next, Param, Headers, HttpRedirectResponse, HostParam } from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response, NextFunction } from 'express';
import { Observable, of } from 'rxjs';
import { IsString, IsInt } from 'class-validator';
import { SupabaseQueryService } from './databaseOperation';
import { HandleSupabaseQuery } from './decorators/supabase-handler.decorator';
import { Throttle, Debounce } from './decorators/throttle-debounce.decorator';

// 定义配置项接口
interface AppConfig {
  id?: number;
  key?: string;
  value?: string;
  description?: string;
  created_at?: Date;
  updated_at?: Date;
}

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
  constructor(
    private readonly appService: AppService,
    private readonly supabaseQueryService: SupabaseQueryService
  ) {
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

  @Get('config')
  @Throttle({
    wait: 2000,  // 2秒内只能调用一次
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
      // 有ID就用ID
      sql = `DELETE FROM app_config WHERE id = ${id}`;
    } else if (key) {
      // 没有ID但有key就用key
      sql = `DELETE FROM app_config WHERE key = '${key}'`;
    } else {
      // 都没有就抛出错误
      throw new HttpException('必须提供key或id参数', HttpStatus.BAD_REQUEST);
    }
    
    return await this.supabaseQueryService.executeSQL<AppConfig>(sql);
  }

}



