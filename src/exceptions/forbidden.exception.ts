import { HttpException, HttpStatus } from '@nestjs/common';

export class ForbiddenException extends HttpException {
  constructor(message = '没有权限访问该资源', errorCode = 1002) {
    super({ message, errorCode }, HttpStatus.FORBIDDEN);
  }
}
