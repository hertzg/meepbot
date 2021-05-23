import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PlayerModule } from './player/player.module';

@Module({
  imports: [ConfigModule.forRoot(), PlayerModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
