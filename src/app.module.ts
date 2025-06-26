import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InitController } from './init/init.controller';
import { SecurityMiddleware } from './middlewares/security.middleware';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'), // 指向 public 目录
      // exclude: ['/api'], // 正确写法，排除所有 /api 路由
      serveRoot: '/', // 静态资源根路径
      exclude: ['*'], // 排除所有路由，只有真实静态资源才会被处理
    }),
  ],
  controllers: [AppController, InitController],
  providers: [AppService],
})
// export class AppModule { }
// 动态移除，目前暂时先使用 app.disable('x-powered-by');
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SecurityMiddleware).forRoutes('*');
  }
}
