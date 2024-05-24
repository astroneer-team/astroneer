import path from 'path';

/**
 * Normalizes an array of file names by applying the `path.normalize` function to each file name.
 *
 * @param fileNames - An array of file names to be normalized.
 * @returns An array of normalized file names.
 */
export function normalizeFileNames(fileNames: string[]): string[] {
  return fileNames.map((fileName) => path.normalize(fileName));
}
