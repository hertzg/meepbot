import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PlayerModule } from './player/player.module';
import { StreamDeckModule } from './stream-deck/stream-deck.module';

@Module({
  imports: [ConfigModule.forRoot(), PlayerModule, StreamDeckModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
