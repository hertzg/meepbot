import { Module } from '@nestjs/common';
import { DiscordModule } from './discord/discord.module';
import { AudioService } from './audio.service';
import { MediaModule } from './media/media.module';
import { PlayerService } from './player.service';
import { PlaylistService } from './playlist.service';
import { CacheService } from './media/cache.service';
import { ManifestService } from './media/manifest.service';
import { StorageService } from './media/storage.service';
import { DownloadService } from './media/download.service';
import { YouTubeModule } from './media/youtube/youtube.module';

@Module({
  imports: [YouTubeModule, DiscordModule, MediaModule],
  controllers: [],
  providers: [
    PlaylistService,
    PlayerService,
    AudioService,
    CacheService,
    ManifestService,
    StorageService,
    DownloadService,
  ],
  exports: [PlayerService, MediaModule, CacheService],
})
export class PlayerModule {}
