import fs from 'fs';
import path from 'path';

export type ScanOptions = {
  /**
   * The root directory to start scanning from.
   */
  rootDir: string;
  /**
   * A list of regular expressions to include files.
   */
  include: RegExp[];
  /**
   * A list of regular expressions to exclude files.
   */
  exclude?: RegExp[];
  /**
   * A callback that is called when a file is found.
   * @param path The path of the file that was found.
   */
  onFile: (path: string) => void | Promise<void>;
};

/**
 * Scans a directory and calls a callback for each file that matches the include and exclude patterns.
 */
export async function scan(options: ScanOptions) {
  const { rootDir, exclude, include, onFile } = options;

  if (!fs.existsSync(rootDir)) {
    return;
  }

  // Recursively scan the directory.
  async function scanDir(dir: string) {
    const files = await fs.promises.readdir(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = await fs.promises.stat(filePath);

      // Skip excluded files.
      if (exclude?.some((re) => re.test(filePath))) {
        continue;
      }

      // Recurse into directories.
      if (stat.isDirectory()) {
        await scanDir(filePath);
      } else {
        // Call the callback for included files.
        if (include?.some((re) => re.test(filePath))) {
          await onFile(filePath);
        }
      }
    }
  }

  await scanDir(rootDir);
}
