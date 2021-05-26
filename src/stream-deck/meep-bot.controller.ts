import { Body, Controller, Post } from '@nestjs/common';
import { PlayerService } from '../player/player.service';
import { ApiTags } from '@nestjs/swagger';
import { PlayNowDto } from './dto/play-now.dto';
import { PlayerControlDto } from './dto/player-control.dto';

@ApiTags('meep-bot')
@Controller('meep-bot')
export class MeepBotController {
  constructor(private readonly player: PlayerService) {}

  @Post('player/play-now')
  async playerPlayNow(@Body() { channel, youtube }: PlayNowDto) {
    return {
      playNow: await this.player.playNow(channel, youtube),
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
