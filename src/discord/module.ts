import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DiscordService } from './discord';
import { ClientProvider } from './client/provider';

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [ClientProvider, DiscordService],
  exports: [DiscordService],
})
export class DiscordModule {}
