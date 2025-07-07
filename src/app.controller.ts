import { Scope, HttpException, HttpStatus, Controller, Get, Req, Post, Body, HttpCode, Header, Redirect, Query, Res, Next, Param, Headers, HttpRedirectResponse, HostParam } from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response, NextFunction } from 'express';
import { Observable, of } from 'rxjs';
import { IsString, IsInt } from 'class-validator';
import { SupabaseQueryService } from './databaseOperation';

// 定义配置项接口
interface AppConfig {
  id: number;
  key: string;
  value: string;
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
  constructor(private readonly appService: AppService, private readonly supabaseQueryService: SupabaseQueryService) {
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

  @Get('a6')
  async getAppConfig() {
    try {
      // 先使用简单的查询，然后逐步测试复杂查询
      const result = await this.supabaseQueryService.executeSQL<AppConfig>(
        'SELECT value FROM app_config where key = "image_token" ORDER BY id ASC'
      );

      if (result.error) {
        throw new HttpException(result.error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }

      return {
        success: true,
        data: result.data,
        message: '操作成功'
      };
    } catch (error) {
      throw new HttpException(
        error.message || '操作失败',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('a7')
  async getFilteredConfig(@Query('key') key?: string) {
    try {
      let sql = "insert into app_config (key, value, description) values ('test', 'test', 'test')";

      const result = await this.supabaseQueryService.executeSQL<AppConfig>(sql);

      if (result.error) {
        throw new HttpException(result.error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }

      return {
        success: true,
        data: result.data,
        message: '操作成功'
      };
    } catch (error) {
      throw new HttpException(
        error.message || '操作失败',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 添加一个测试指定字段查询的接口
  @Get('a8')
  async getSpecificFields() {
    try {
      // 测试指定字段的查询
      const result = await this.supabaseQueryService.executeSQL<AppConfig>(
        'SELECT id, key, value FROM app_config ORDER BY id ASC'
      );

      if (result.error) {
        throw new HttpException(result.error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }

      return {
        success: true,
        data: result.data,
        message: '获取指定字段成功'
      };
    } catch (error) {
      throw new HttpException(
        error.message || '查询失败',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

}



