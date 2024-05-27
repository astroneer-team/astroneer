import { DIST_FOLDER, SOURCE_FOLDER } from '@astroneer/config';
import path from 'path';

export default function outputFilePath(file: string) {
  return path.resolve(
    DIST_FOLDER,
    path.relative(SOURCE_FOLDER, file.replace(/\.(j|t)s?$/, '.js')),
  );
}
