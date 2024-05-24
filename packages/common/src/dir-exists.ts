import fs from 'fs';

/**
 * Checks if a directory exists at the specified path.
 *
 * @param dirPath - The path of the directory to check.
 * @returns A boolean indicating whether the directory exists.
 */
export function dirExists(dirPath: string) {
  return fs.existsSync(dirPath) && fs.lstatSync(dirPath).isDirectory();
}
