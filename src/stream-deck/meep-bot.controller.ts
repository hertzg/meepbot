import { Body, Controller, Post } from '@nestjs/common';
import { PlayerService } from '../player/player.service';
import { ApiTags } from '@nestjs/swagger';
import { PlayNowDto } from './dto/play-now.dto';

@ApiTags('meep-bot')
@Controller('meep-bot')
export class MeepBotController {
  constructor(private readonly player: PlayerService) {}

  @Post('player')
  play(@Body() dto: PlayNowDto) {
    return this.player.playNow(dto.channel, dto.youtube);
  }
}
