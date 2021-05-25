import { ApiProperty } from '@nestjs/swagger';

export class PlayNowDto {
  @ApiProperty()
  youtube!: string;

  @ApiProperty()
  channel!: string;
}
