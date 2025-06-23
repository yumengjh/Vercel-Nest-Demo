import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.DEFAULT })
export class AppService {
  private count = 0; // 全局共享状态
  getHello(): string {
    return ++this.count + "";
  }
}
