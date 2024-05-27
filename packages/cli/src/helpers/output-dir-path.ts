import { DIST_FOLDER } from '@astroneer/config';
import path from 'path';

export default function outputDirPath(file: string) {
  return path.dirname(
    path
      .resolve(file)
      .replace(/src/, path.relative(process.cwd(), DIST_FOLDER)),
  );
}
