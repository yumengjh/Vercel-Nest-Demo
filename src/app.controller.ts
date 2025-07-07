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
  path: 'v1',
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

  @Get('userlist')
  @HandleSupabaseQuery({
    successMessage: '获取用户列表成功',
    errorMessage: '获取用户列表失败',
    defaultErrorStatus: HttpStatus.BAD_REQUEST
  })
  async getUserList() {
    return await this.supabaseQueryService.executeSQL<AppConfig>(
      `SELECT username FROM users`
    );
  }


  @Post('register')
  async register(@Body() body: any, @Req() req: any) {
    // 1. 字段准备与默认值处理
    const {
      username,
      password,
      email = null,
      gender = 'other',   // male, female, other
      age = null,
      role = 'user',
      bio = null,
      avatar_url = null,
      phone = null,
      address = null
    } = body;

    // 2. 获取注册IP
    let register_ip = null;
    if (req && req.ip) {
      // 兼容 x-forwarded-for
      register_ip = req.ip || req.headers['x-forwarded-for']?.split(',')[0]?.trim();
    }

    // 3. 构造SQL
    // 注意：此处为演示，实际生产环境必须对输入做严格校验和防注入处理
    const sql = `
      INSERT INTO users (
        username, password, email, gender, age, role, is_active, is_banned, bio, avatar_url, phone, register_ip,address
      ) VALUES (
        '${username}', 
        '${password}', 
        ${email ? `'${email}'` : 'NULL'}, 
        '${['male', 'female', 'other'].includes(gender) ? gender : 'other'}', 
        ${age !== null && !isNaN(Number(age)) ? Number(age) : 'NULL'}, 
        '${['admin', 'editor', 'user'].includes(role) ? role : 'user'}', 
        true, 
        false, 
        ${bio ? `'${bio}'` : 'NULL'}, 
        ${avatar_url ? `'${avatar_url}'` : 'NULL'}, 
        ${phone ? `'${phone}'` : 'NULL'}, 
        ${register_ip ? `'${register_ip}'` : 'NULL'}, 
        ${address ? `'${address}'` : 'NULL'}
      )
    `;

    return await this.supabaseQueryService.executeSQL<AppConfig>(sql);
  }

  @Post('updateUserInfo')
  async updateUserInfo(@Body() body: any) {
    let whereClause = '';
    if (body.uuid) {
      whereClause = `uuid = '${body.uuid}'`;
    }
    else if (body.phone) {
      whereClause = `phone = '${body.phone}'`;
    } else if (body.email) {
      whereClause = `email = '${body.email}'`;
    } else {
      // 如果都没有，返回错误
      throw new HttpException('请提供手机号或邮箱用于更新用户信息', HttpStatus.BAD_REQUEST);
    }

    // 注意：此处未做SQL注入防护，生产环境请严格校验
    const sql = `UPDATE users SET ${body.key} = '${body.value}' WHERE ${whereClause}`;
    return await this.supabaseQueryService.executeSQL<AppConfig>(sql);
  }


  @Post('login')
  @Throttle({
    wait: 2000,  // 2秒内只能调用一次
    errorMessage: '登录操作太频繁，请稍后再试',
    errorStatus: HttpStatus.TOO_MANY_REQUESTS
  })
  async login(@Body() body: any, @Req() req: any) {
    const result = await this.supabaseQueryService.executeSQL<AppConfig>(
      `SELECT * FROM users WHERE username = '${body.username}' AND password = '${body.password}'`
    );
    if (result.data.length > 0) {

      // 登录成功后更新最新IP和登录时间
      const sql = `UPDATE users SET last_active_ip = '${req.ip || req.headers['x-forwarded-for']?.split(',')[0]?.trim()}', last_active_at = '${new Date().toISOString()}' WHERE uuid = '${result.data[0].uuid}'`;
      await this.supabaseQueryService.executeSQL<AppConfig>(sql);

      return {
        status: 200,
        message: '登录成功',
        data: {
          uuid: result.data[0].uuid,
          username: result.data[0].username,
          ip: req.ip || req.headers['x-forwarded-for']?.split(',')[0]?.trim(),
          last_active_at: new Date().toISOString()
        }
      }
    } else {
      throw new HttpException('登录失败', HttpStatus.UNAUTHORIZED);
    }
  }

  @Post('deleteUser')
  async deleteUser(@Body() body: any) {
    return await this.supabaseQueryService.executeSQL<AppConfig>(
      `DELETE FROM users WHERE id = ${body.id}`
    );
  }

  @Get('quote')
  @HandleSupabaseQuery({
    successMessage: '获取励志语录成功',
    errorMessage: '获取励志语录失败',
    defaultErrorStatus: HttpStatus.BAD_REQUEST
  })
  @Throttle({
    wait: 2000,  // 2秒内只能调用一次
    errorMessage: '查询操作太频繁，请稍后再试',
    errorStatus: HttpStatus.TOO_MANY_REQUESTS
  })
  async getRandomQuote() {
    // 生成1到100之间的随机ID（假设数据库中有100条记录）
    const randomId = Math.floor(Math.random() * 100) + 1;

    return await this.supabaseQueryService.executeSQL<AppConfig>(
      `SELECT id, quote FROM motivational_quotes WHERE enable = true AND id = ${randomId}`
    );
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



