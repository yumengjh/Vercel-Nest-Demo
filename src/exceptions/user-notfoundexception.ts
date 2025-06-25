import { HttpException, HttpStatus } from '@nestjs/common';

export class UserNotFoundException extends HttpException {
  constructor(message = '用户不存在', errorCode = 1004) {
    super({ message, errorCode }, HttpStatus.NOT_FOUND);
  }
}
