import { Injectable } from '@nestjs/common';
import { Client } from 'discord.js';

@Injectable()
export class DiscordService {
  constructor(private client: Client) {
    console.log('got client!');
  }
}
