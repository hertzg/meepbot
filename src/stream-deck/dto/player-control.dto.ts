import { ApiProperty } from '@nestjs/swagger';

export class PlayerControlDto {
  @ApiProperty()
  channel!: string;

  @ApiProperty()
  action!: 'togglePause' | 'resume' | 'pause' | 'stop' | 'skip';
}
