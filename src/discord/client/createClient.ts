import { Client } from 'discord.js';
import pEvent from 'p-event';

export const createClient = async (token: string): Promise<Client> => {
  const client = new Client();
  client.login(token);

  await pEvent(client, 'ready');

  return client;
};
