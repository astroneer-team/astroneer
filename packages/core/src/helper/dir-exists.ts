import fs from 'fs';

export function dirExists(dirPath: string) {
  return fs.existsSync(dirPath) && fs.lstatSync(dirPath).isDirectory();
}
