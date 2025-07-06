import { Injectable, Scope, HttpException, HttpStatus, ImATeapotException } from '@nestjs/common';

@Injectable({ scope: Scope.DEFAULT })
export class AppService {
  private count = 0; // 全局共享状态
  private id = '';
  getHello(): string {
    throw new ImATeapotException('我是一个彩蛋main', {
      cause: new Error('彩蛋信息cause'),
      description: '彩蛋的描述信息description'
    })
    throw new Error("服务器发生未知错误！")
    return ++this.count + "";
  }

}
