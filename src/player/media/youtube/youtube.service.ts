import { Injectable } from '@nestjs/common';
import { chooseFormat, getInfo, getVideoID } from 'ytdl-core';
import * as ytpl from 'ytpl';

interface IFindAudioStreamOptions {
  quality: 'lowest' | 'highest';
}

@Injectable()
export class YouTubeService {
  videoMediaUrl = async (
    url: string,
    options: IFindAudioStreamOptions = { quality: 'highest' },
  ) => {
    const info = await getInfo(url);
    const chosen = chooseFormat(info.formats, {
      filter: 'audioonly',
      quality: `${options.quality}audio`,
    });

    return chosen.url;
  };

  playlistId = async (url: string) => await ytpl.getPlaylistID(url);
  videoId = async (url: string) => await getVideoID(url);

  playlistVideos = async (linkOrId: string) => {
    const playlist = await ytpl(await ytpl.getPlaylistID(linkOrId), {
      limit: Infinity,
      pages: Infinity,
    });
    return playlist.items.map((i) => i.url);
  };
}
