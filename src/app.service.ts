import { Injectable, Scope, HttpException, HttpStatus } from '@nestjs/common';
import { RateLimitExceededException } from './exceptions/rateLimit-exceeded.exception'

@Injectable({ scope: Scope.DEFAULT })
export class AppService {
  private count = 0; // 全局共享状态
  getHello(): string {
    return ++this.count + "";
  }
  /**
   * demo6方法：每次调用计数+1，超过3次后进入冷却5秒，期间再次调用会抛出限流异常
   */
  private lastExceededTime: number | null = null;

  demo6() {
    const now = Date.now();

    // 如果已超限，判断是否处于冷却期
    if (this.count > 3) {
      if (this.lastExceededTime && (now - this.lastExceededTime < 5000)) {
        // 5秒冷却期内，直接抛出异常
        throw new RateLimitExceededException('服务器爆炸啦 💥，请5秒后再试');
      } else {
        // 冷却期已过，重置计数器和冷却时间
        this.count = 1;
        this.lastExceededTime = null;
      }
    } else {
      this.count++;
    }

    // 如果本次操作导致超限，记录冷却开始时间并抛出异常
    if (this.count > 3) {
      this.lastExceededTime = now;
      throw new RateLimitExceededException('服务器爆炸啦 💥，请5秒后再试');
    }

    return { message: '访问成功' };
  }
}
