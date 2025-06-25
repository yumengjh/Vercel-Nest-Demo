import { HttpException, HttpStatus } from '@nestjs/common';

export class ResourceConflictException extends HttpException {
  constructor(message = '资源已存在', errorCode = 1006) {
    super({ message, errorCode }, HttpStatus.CONFLICT);
  }
}
