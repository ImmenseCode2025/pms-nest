import { Module } from '@nestjs/common';
import { ExternalApiModule } from 'src/core/external-api/external-api.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [ExternalApiModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
