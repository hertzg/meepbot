import { Module } from '@nestjs/common';
import { YouTubeModule } from './youtube/youtube.module';
import { DownloadService } from './download.service';
import { CacheService } from './cache.service';
import { StorageService } from './storage.service';
import { MediaService } from './media.service';
import { CacheController } from './cache.controller';
import { ManifestService } from './manifest.service';

@Module({
  imports: [YouTubeModule],
  controllers: [CacheController],
  providers: [
    MediaService,
    DownloadService,
    CacheService,
    StorageService,
    ManifestService,
  ],
  exports: [MediaService],
})
export class MediaModule {}
