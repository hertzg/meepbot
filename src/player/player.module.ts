import { Module } from '@nestjs/common';
import { DiscordModule } from './discord/discord.module';
import { YouTubeModule } from './youtube/youtube.module';
import { StreamingService } from './streaming.service';
import { PlayerService } from './player.service';
import { PlayerController } from './player.controller';

@Module({
  imports: [DiscordModule, YouTubeModule],
  controllers: [PlayerController],
  providers: [StreamingService, PlayerService],
  exports: [PlayerService],
})
export class PlayerModule {}
