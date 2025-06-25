import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidParamsException extends HttpException {
  constructor(message = '请求参数不合法', errorCode = 1003) {
    super({ message, errorCode }, HttpStatus.BAD_REQUEST);
  }
}
