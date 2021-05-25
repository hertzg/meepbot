import { Module } from '@nestjs/common';
import { YouTubeModule } from './youtube/youtube.module';
import { DownloadService } from './download.service';
import { CacheService } from './cache.service';
import { StorageService } from './storage.service';
import { MediaService } from './media.service';
import { ManifestService } from './manifest.service';

@Module({
  imports: [YouTubeModule],
  controllers: [],
  providers: [
    MediaService,
    ManifestService,
    DownloadService,
    CacheService,
    StorageService,
  ],
  exports: [MediaService],
})
export class MediaModule {}
