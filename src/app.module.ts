import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DiscordModule } from './discord/discord.module';
import { MixerModule } from './mixer/mixer.module';
import { YoutubeModule } from './youtube/youtube.module';

@Module({
  imports: [ConfigModule.forRoot(), DiscordModule, MixerModule, YoutubeModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
