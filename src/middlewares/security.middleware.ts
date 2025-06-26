import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    res.removeHeader('x-powered-by');
    res.setHeader('x-author-by', 'YuMengJiangHu');
    // 你也可以根据请求动态设置 header，例如：
    // if (req.path.startsWith('/api')) {
    //   res.setHeader('x-api-access', 'true');
    // }
    next();
  }
}