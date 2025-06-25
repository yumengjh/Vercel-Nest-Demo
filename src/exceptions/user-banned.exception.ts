import { HttpException, HttpStatus } from '@nestjs/common';

export class UserBannedException extends HttpException {
  constructor(message = '账号已被封禁', errorCode = 1005) {
    super({ message, errorCode }, HttpStatus.FORBIDDEN);
  }
}
