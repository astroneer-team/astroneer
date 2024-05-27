import { existsSync, rmSync } from 'fs';
import path from 'path';

export function deleteTemplatesFolder() {
  const templatesFolderPath = path.resolve(__dirname, '../templates');
  if (existsSync(templatesFolderPath)) {
    rmSync(templatesFolderPath, { recursive: true });
  }
}
