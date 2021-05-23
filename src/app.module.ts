import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DiscordModule } from './discord/discord.module';
import { AudioModule } from './audio/audio.module';

@Module({
  imports: [ConfigModule.forRoot(), DiscordModule, AudioModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
