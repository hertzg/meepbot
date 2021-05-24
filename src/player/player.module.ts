import { Module } from '@nestjs/common';
import { DiscordModule } from './discord/discord.module';
import { PlayerService } from './player.service';
import { PlayerController } from './player.controller';
import { MediaModule } from './media/media.module';

@Module({
  imports: [DiscordModule, MediaModule],
  controllers: [PlayerController],
  providers: [PlayerService],
  exports: [PlayerService],
})
export class PlayerModule {}
