import { Injectable, Logger } from '@nestjs/common';
import { chooseFormat, getInfo, getVideoID } from 'ytdl-core';
import ytpl from 'ytpl';
import mem from 'mem';

interface IFindAudioStreamOptions {
  quality: 'lowest' | 'highest';
}

const ITAG_OPUS = 251;

@Injectable()
export class YouTubeService {
  private readonly logger = new Logger(YouTubeService.name);

  mediaUrl = async (
    watchLink: string,
    options: IFindAudioStreamOptions = { quality: 'highest' },
  ) => {
    const info = await getInfo(watchLink);
    const chosen = chooseFormat(info.formats, {
      filter: 'audioonly',
      quality: `${options.quality}audio`,
    });

    if (chosen.itag !== ITAG_OPUS) {
      this.logger.warn(`[${watchLink}] OPUS Stream not available.`);
      return;
    }

    return chosen.url;
  };

  extractPlaylistId = async (playlistLink: string) => {
    try {
      return await ytpl.getPlaylistID(playlistLink);
    } catch (e) {
      return;
    }
  };

  extractVideoId = async (watchLink: string) => await getVideoID(watchLink);

  playlistWatchLinks = mem(
    async (playlistLink: string) => {
      const playlist = await ytpl(await ytpl.getPlaylistID(playlistLink), {
        limit: Infinity,
        pages: Infinity,
      });
      return playlist.items.map((i) => i.url);
    },
    { maxAge: 60000 },
  );
}
