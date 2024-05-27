import { cpSync, existsSync, rmSync } from 'fs';

export async function copyTemplates(
  dir: string,
  targetDir: string,
): Promise<void> {
  if (existsSync(targetDir)) {
    rmSync(targetDir, { recursive: true });
  }

  cpSync(dir, targetDir, {
    recursive: true,
  });
}
