import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DiscordModule } from './discord/module';

@Module({
  imports: [ConfigModule.forRoot(), DiscordModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
