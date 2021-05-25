import { Module } from '@nestjs/common';
import { YouTubeService } from './youtube.service';

@Module({
  imports: [],
  controllers: [],
  providers: [YouTubeService],
  exports: [YouTubeService],
})
export class YouTubeModule {}
