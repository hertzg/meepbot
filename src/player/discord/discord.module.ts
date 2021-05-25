import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DiscordService } from './discord.service';
import { DiscordController } from './discord.controller';
import { Client } from 'discord.js';

@Module({
  imports: [ConfigModule],
  controllers: [DiscordController],
  providers: [Client, DiscordService],
  exports: [DiscordService],
})
export class DiscordModule {}
