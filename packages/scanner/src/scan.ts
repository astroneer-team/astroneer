import { dirExists } from '@astroneer/common';
import fs from 'fs';
import path from 'path';
import { ScanOptions, ScanSyncOptions } from './types/scan-options';

export function scan(options: ScanOptions) {
  const { rootDir, ignore, searchFor, onFile } = options;

  if (!dirExists(rootDir)) {
    return;
  }

  const scanDir = async (dir: string) => {
    const files = await fs.promises.readdir(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = await fs.promises.stat(filePath);

      if (ignore?.some((re) => re.test(filePath))) {
        continue;
      }

      if (stat.isDirectory() && !options.onlyRootDir) {
        await scanDir(filePath);
      } else {
        const normalizedPath = path.normalize(filePath).replaceAll(/\\/g, '/');

        if (searchFor.some((re) => re.test(normalizedPath))) {
          await onFile(filePath);
        }
      }
    }
  };

  return scanDir(rootDir);
}

export function scanSync(options: ScanSyncOptions) {
  const { rootDir, ignore, searchFor, onFile } = options;

  if (!fs.existsSync(rootDir)) {
    return;
  }

  const scanDirSync = (dir: string) => {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (ignore?.some((re) => re.test(filePath))) {
        continue;
      }

      if (stat.isDirectory() && !options.onlyRootDir) {
        scanDirSync(filePath);
      } else {
        const normalizedPath = path.normalize(filePath).replaceAll(/\\/g, '/');

        if (searchFor.some((re) => re.test(normalizedPath))) {
          onFile(filePath);
        }
      }
    }
  };

  scanDirSync(rootDir);
}
