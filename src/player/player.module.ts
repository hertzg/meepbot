import { Module } from '@nestjs/common';
import { DiscordModule } from './discord/discord.module';
import { AudioService } from './audio.service';
import { AudioController } from './audio.controller';
import { MediaModule } from './media/media.module';
import { PlayerService } from './player.service';
import { PlaylistService } from './playlist.service';
import { PlayerController } from './player.controller';

@Module({
  imports: [DiscordModule, MediaModule],
  controllers: [PlayerController, AudioController],
  providers: [PlaylistService, PlayerService, AudioService],
  exports: [PlayerService],
})
export class PlayerModule {}
