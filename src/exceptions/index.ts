import { HttpException, HttpStatus } from '@nestjs/common';

export class ForbiddenException extends HttpException {
  constructor(message = '没有权限访问该资源', errorCode = 1002) {
    super({ message, errorCode }, HttpStatus.FORBIDDEN);
  }
}

export class InvalidParamsException extends HttpException {
  constructor(message = '请求参数不合法', errorCode = 1003) {
    super({ message, errorCode }, HttpStatus.BAD_REQUEST);
  }
}

export class RateLimitExceededException extends HttpException {
  constructor(message = '请求过于频繁，请稍后再试', errorCode = 1007) {
    super({ message, errorCode }, HttpStatus.TOO_MANY_REQUESTS);
  }
}

export class ResourceConflictException extends HttpException {
  constructor(message = '资源已存在', errorCode = 1006) {
    super({ message, errorCode }, HttpStatus.CONFLICT);
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message = '请先登录', errorCode = 1001) {
    super({ message, errorCode }, HttpStatus.UNAUTHORIZED);
  }
}

export class UserBannedException extends HttpException {
  constructor(message = '账号已被封禁', errorCode = 1005) {
    super({ message, errorCode }, HttpStatus.FORBIDDEN);
  }
}

export class UserNotFoundException extends HttpException {
  constructor(message = '用户不存在', errorCode = 1004) {
    super({ message, errorCode }, HttpStatus.NOT_FOUND);
  }
}