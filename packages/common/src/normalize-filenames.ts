import path from 'path';

export function normalizeFileNames(fileNames: string[]): string[] {
  return fileNames.map((fileName) => path.normalize(fileName));
}
