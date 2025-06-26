import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // 移除 x-powered-by
    res.removeHeader('x-powered-by');
    // 你可以根据需要移除更多 header
    // res.removeHeader('server');
    // res.removeHeader('some-other-header');
    next();
  }
}