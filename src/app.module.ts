import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InitController } from './init/init.controller';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'), // 指向 public 目录
      // exclude: ['/api'], // 正确写法，排除所有 /api 路由
    }),
  ],
  controllers: [AppController, InitController],
  providers: [AppService],
})
export class AppModule {}
