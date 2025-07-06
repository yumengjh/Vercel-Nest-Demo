import { Module } from '@nestjs/common';
import { ImageProxyController } from './image-gateway.controller';
import { AppService } from './image-gateway.service';
import { AppConfigService } from '../ConfigService';

@Module({
  controllers: [ImageProxyController],
  providers: [AppService, AppConfigService],
  exports: [AppService], // 导出服务，以便其他模块可以使用
})
export class ImageGatewayModule {} 