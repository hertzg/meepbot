import { Module } from '@nestjs/common';
import { DiscordModule } from './discord/discord.module';
import { PlaybackService } from './playback.service';
import { PlaybackController } from './playback.controller';
import { MediaModule } from './media/media.module';
import { PlayerService } from './player.service';
import { PlaylistService } from './playlist.service';
import { PlayerController } from './player.controller';

@Module({
  imports: [DiscordModule, MediaModule],
  controllers: [PlayerController, PlaybackController],
  providers: [PlaylistService, PlayerService, PlaybackService],
  exports: [PlayerService],
})
export class PlayerModule {}
