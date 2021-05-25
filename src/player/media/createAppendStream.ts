import { createWriteStream, PathLike, promises } from 'fs';

export const createAppendStream = (path: PathLike) =>
  promises.readFile(path, { flag: 'a+' }).then(
    (contents) =>
      [
        contents,
        createWriteStream(path, {
          flags: 'a',
        }),
      ] as const,
  );
