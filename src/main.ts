// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';

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

    // 设置全局 ValidationPipe，开启白名单过滤和禁止非白名单属性
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      transform: true, // 允许类型自动转换(装饰器标记)
      transformOptions: {
        enableImplicitConversion: true, // 启用隐式类型转换(允许不写 显式装饰器 也能根据类型推断自动转换)
      },
    }));

    // 初始化应用，确保所有模块、依赖注入容器和生命周期钩子都已正确设置
    // 这一步对于确保应用在 Vercel 环境下正常工作至关重要
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
