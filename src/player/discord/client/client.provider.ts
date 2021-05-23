import { createClient } from './createClient';
import { FactoryProvider } from '@nestjs/common';
import { Client } from 'discord.js';
import { ConfigService } from '@nestjs/config';

export const ClientProvider: FactoryProvider<Promise<Client>> = {
  provide: Client,
  useFactory: async (config: ConfigService) => {
    return createClient(config.get('DISCORD_BOT_TOKEN'));
  },
  inject: [ConfigService],
};
