import { copyFileSync, mkdirSync, readdirSync } from 'fs';
import path from 'path';

export function copyTemplateFiles({
  srcDir,
  destDir,
}: {
  srcDir: string;
  destDir: string;
}) {
  mkdirSync(destDir, { recursive: true });
  const entries = readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      copyTemplateFiles({ srcDir: srcPath, destDir: destPath });
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}
