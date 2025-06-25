import { HttpException, HttpStatus } from '@nestjs/common';

export class RateLimitExceededException extends HttpException {
  constructor(message = '请求过于频繁，请稍后再试', errorCode = 1007) {
    super({ message, errorCode }, HttpStatus.TOO_MANY_REQUESTS);
  }
}
