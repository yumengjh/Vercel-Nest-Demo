import { Injectable, Scope, HttpException, HttpStatus, ImATeapotException } from '@nestjs/common';
import axios from 'axios';
import { Response } from 'express';

@Injectable()
export class AppService {
  // 图片代理方法
  async proxyImage(imgPath: string, res: Response) {
    // 拼接原始图片地址
    const originUrl = `https://image.yumeng.icu/${imgPath}`;

    try {
      // 拉取图片内容
      const response = await axios.get(originUrl, {
        responseType: 'stream',
      });

      // 设置响应头
      res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg');
      // 为图片设置适当的缓存策略，但确保验证失败不会被缓存
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600'); // 缓存1小时
      res.setHeader('Vary', 'Referer'); // 根据Referer变化缓存

      // 直接把图片流返回给前端
      response.data.pipe(res);
    } catch (err) {
      throw new HttpException('Image not found', HttpStatus.NOT_FOUND);
    }
  }
}
