import { Module } from '@nestjs/common';
import { PlayerModule } from '../player/player.module';
import { RestApiController } from './rest-api.controller';

@Module({
  imports: [PlayerModule],
  controllers: [RestApiController],
})
export class RestApiModule {}
