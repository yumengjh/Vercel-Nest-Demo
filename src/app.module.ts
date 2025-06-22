import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InitController } from './init/init.controller';

@Module({
  imports: [],
  controllers: [AppController, InitController],
  providers: [AppService],
})
export class AppModule {}
