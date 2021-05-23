import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DiscordService } from './discord.service';
import { ClientProvider } from './client/client.provider';
import { DiscordController } from './discord.controller';

@Module({
  imports: [ConfigModule],
  controllers: [DiscordController],
  providers: [ClientProvider, DiscordService],
  exports: [DiscordService],
})
export class DiscordModule {}
