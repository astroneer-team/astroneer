import fs from 'fs';
import path from 'path';

export type ScanOptions = {
  rootDir: string;
  include: RegExp[];
  exclude?: RegExp[];
  onFile: (path: string) => void;
};

export async function scan(options: ScanOptions) {
  const { rootDir, exclude, include, onFile } = options;

  if (!fs.existsSync(rootDir)) {
    return;
  }

  async function scanDir(dir: string) {
    const files = await fs.promises.readdir(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = await fs.promises.stat(filePath);

      if (exclude?.some((re) => re.test(filePath))) {
        continue;
      }

      if (stat.isDirectory()) {
        await scanDir(filePath);
      } else {
        if (include?.some((re) => re.test(filePath))) {
          onFile(filePath);
        }
      }
    }
  }

  await scanDir(rootDir);
}
