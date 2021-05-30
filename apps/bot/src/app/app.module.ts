import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PlayerModule } from './player/player.module';
import { RestApiModule } from './rest-api/rest-api.module';

@Module({
  imports: [ConfigModule.forRoot(), PlayerModule, RestApiModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
