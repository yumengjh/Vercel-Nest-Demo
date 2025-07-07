import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InitController } from './init/init.controller';
import { SecurityMiddleware } from './middlewares/security.middleware';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filters/all-exceptions.filter';
import { ImageGatewayModule } from './imageGateway/image-gateway.module';
import { SupabaseQueryService } from './databaseOperation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 全局配置，所有模块都可以使用
      envFilePath: '.env', // 指定 .env 文件路径
      cache: true, // 缓存环境变量
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'), // 指向 public 目录
      // exclude: ['/api'], // 正确写法，排除所有 /api 路由
      serveRoot: '/', // 静态资源根路径
      exclude: ['*'], // 排除所有路由，只有真实静态资源才会被处理
    }),
    // ImageGatewayModule, // 引入图片网关模块
  ],
  controllers: [AppController, InitController],
  providers: [AppService, {
    provide: APP_FILTER,
    useClass: HttpExceptionFilter,
  },
    SupabaseQueryService],
})
// export class AppModule { }
// 动态移除，目前暂时先使用 app.disable('x-powered-by');
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SecurityMiddleware).forRoutes('*');
  }
}
