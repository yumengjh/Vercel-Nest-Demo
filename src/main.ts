// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';

let cachedApp: INestApplication;

export async function bootstrap(): Promise<INestApplication> {
  if (!cachedApp) {
    const app = await NestFactory.create(AppModule);

    // 启用代理信任，以便正确解析 Vercel 转发的 IP
    app.getHttpAdapter().getInstance().set('trust proxy', 1);

    app.enableCors({
      origin: true,
      credentials: true,
    });

    await app.init();
    cachedApp = app;
  }
  return cachedApp;
}

// 如果不是在 Vercel 环境下（即本地运行），就执行监听端口
if (!process.env.VERCEL) {
  bootstrap().then(app => {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`🚀 Local server listening on http://localhost:${port}`);
    });
  });
}

// 如果是 Vercel，则导出 handler
export default async function handler(req, res) {
  const app = await bootstrap();
  const httpAdapter = app.getHttpAdapter();
  return httpAdapter.getInstance()(req, res);
}
