import fs from 'fs';
import path from 'path';
import { dirExists } from './helper/dir-exists';

export function createAstroneerFolderIfNotExists() {
  const astroneerFolder = path.resolve(process.cwd(), '.astroneer');

  if (!dirExists(astroneerFolder)) {
    fs.mkdirSync(astroneerFolder);
  }

  return astroneerFolder;
}
