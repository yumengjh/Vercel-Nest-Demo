import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { SupabaseQueryService } from '../databaseOperation';

@Module({
  controllers: [UserController],
  providers: [UserService, SupabaseQueryService],
  exports: [UserService]
})
export class UserModule {} 