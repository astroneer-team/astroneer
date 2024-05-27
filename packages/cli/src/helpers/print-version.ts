import { readFileSync } from 'fs';
import path from 'path';
import picocolors from 'picocolors';

export function printVersion() {
  const packageJsonPath = path.resolve(__dirname, '../package.json');
  const packageJson = readFileSync(packageJsonPath, 'utf-8');
  const { version } = JSON.parse(packageJson);
  console.log(picocolors.blue(`>_  Astroneer.js CLI v${version}`));
}
