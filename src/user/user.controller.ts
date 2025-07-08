import { Controller, Get, Post, Body, Req, HttpException, HttpStatus } from '@nestjs/common';
import { HandleSupabaseQuery } from '../decorators/supabase-handler.decorator';
import { Throttle } from '../decorators/throttle-debounce.decorator';
import { UserService } from './user.service';
import { IsString } from 'class-validator';
import { Type } from 'class-transformer';

class LoginDto {
  @IsString()
  @Type(() => String)
  username: string;
  @IsString()
  @Type(() => String)
  password: string;
}

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('list')
  @HandleSupabaseQuery({
    successMessage: '获取用户列表成功',
    errorMessage: '获取用户列表失败',
    defaultErrorStatus: HttpStatus.BAD_REQUEST
  })
  async getUserList() {
    return await this.userService.getUserList();
  }

  @Post('register')
  async register(@Body() body: any, @Req() req: any) {
    return await this.userService.register(body, req);
  }

  @Post('updateInfo')
  async updateUserInfo(@Body() body: any) {
    return await this.userService.updateUserInfo(body);
  }

  @Post('login')
  @Throttle({
    wait: 2000,
    errorMessage: '登录操作太频繁，请稍后再试',
    errorStatus: HttpStatus.TOO_MANY_REQUESTS
  })
  async login(@Body() body: LoginDto, @Req() req: any) {
    return await this.userService.login(body, req);
  }

  @Post('delete')
  async deleteUser(@Body() body: any) {
    return await this.userService.deleteUser(body);
  }
} 