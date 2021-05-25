import { Injectable } from '@nestjs/common';
import { chooseFormat, getInfo } from 'ytdl-core';

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
}
