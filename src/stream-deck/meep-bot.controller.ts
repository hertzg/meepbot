import { Body, Controller, Post, Query } from '@nestjs/common';
import { PlayerService } from '../player/player.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { PlayNowDto } from './dto/play-now.dto';
import { PlayerControlDto } from './dto/player-control.dto';
import { MediaService } from '../player/media/media.service';
import { nanoid } from 'nanoid';

@ApiTags('meep-bot')
@Controller('meep-bot')
export class MeepBotController {
  constructor(
    private readonly player: PlayerService,
    private readonly media: MediaService,
  ) {}

  @Post('player/cache/preheat')
  @ApiQuery({ name: 'youtube', type: 'string' })
  async preheatCache(@Query('youtube') link: string) {
    const info = await this.media.fetchYouTubeLink(link);

    const cached = Object.fromEntries(
      await Promise.all(
        info.watchUrls.map(async (watchLink) => [
          watchLink,
          await this.media.cacheYouTubeWatchLink(
            watchLink,
            `cachePreheat-${nanoid()}`,
          ),
        ]),
      ),
    );

    return {
      info,
      cached,
    };
  }

  @Post('player/play-now')
  async playerPlayNow(
    @Body() { channel, youtube, shuffle = true }: PlayNowDto,
  ) {
    const info = await this.media.fetchYouTubeLink(youtube);
    const watchUrls = shuffle
      ? info.watchUrls.sort(() => Math.random() - 0.5)
      : info.watchUrls;

    return {
      info,
      playNow: await this.player.playNow(channel, watchUrls),
    };
  }

  @Post('player/play-temp')
  async playerPlayTemp(
    @Body() { channel, youtube, shuffle = false }: PlayNowDto,
  ) {
    const info = await this.media.fetchYouTubeLink(youtube);
    const watchUrls = shuffle
      ? info.watchUrls.sort(() => Math.random() - 0.5)
      : info.watchUrls;

    return {
      info,
      playTemp: await this.player.playTemp(channel, watchUrls),
    };
  }

  @Post('player/control')
  async playerControl(@Body() { channel, action }: PlayerControlDto) {
    switch (action) {
      case 'togglePause':
        return { action, [action]: await this.player.togglePause(channel) };
      case 'resume':
        return { action, [action]: await this.player.resume(channel) };
      case 'pause':
        return { action, [action]: await this.player.pause(channel) };
      case 'skip':
        return { action, [action]: await this.player.skip(channel) };
      case 'stop':
        return { action, [action]: await this.player.stop(channel) };
    }
  }
}
