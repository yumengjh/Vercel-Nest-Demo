import { HttpException, HttpStatus } from '@nestjs/common';

export class UnauthorizedException extends HttpException {
  constructor(message = '请先登录', errorCode = 1001) {
    super({ message, errorCode }, HttpStatus.UNAUTHORIZED);
  }
}
