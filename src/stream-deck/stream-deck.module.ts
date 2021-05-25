import { Module } from '@nestjs/common';
import { PlayerModule } from '../player/player.module';
import { MeepBotController } from './meep-bot.controller';

@Module({
  imports: [PlayerModule],
  controllers: [MeepBotController],
})
export class StreamDeckModule {}
