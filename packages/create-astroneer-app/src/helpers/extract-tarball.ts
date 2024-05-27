import { createWriteStream } from 'fs';
import path from 'path';
import { pipeline, Readable } from 'stream';
import * as tar from 'tar';
import { promisify } from 'util';

const asyncPipeline = promisify(pipeline);

export async function extractTarball({
  stream,
  tarPath,
  rootDir,
}: {
  stream: Readable;
  tarPath: string;
  rootDir: string;
}): Promise<string> {
  let tmp = '';
  const writeStream = createWriteStream(tarPath);
  await asyncPipeline(stream, writeStream);
  await tar.list({
    file: tarPath,
    onentry(entry) {
      tmp = path.resolve(
        rootDir,
        entry.path.replaceAll(/\\/g, '/').split('/')[0],
      );
    },
  });

  await tar.extract({
    file: tarPath,
    cwd: rootDir,
  });

  return tmp;
}
