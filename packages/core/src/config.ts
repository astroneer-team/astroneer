import { Logger } from '@astroneer/common';
import { resolve } from 'path';
import { CONFIG_FILE } from './constants';

export interface AstroneerConfig {
  outDir: string;
}

export function defineConfig({
  outDir = '.astroneer',
}: Partial<AstroneerConfig>) {
  return {
    outDir: resolve(process.cwd(), outDir),
  };
}

export async function loadConfig(): Promise<AstroneerConfig> {
  try {
    const config = await import(CONFIG_FILE).then((m) => m.default);
    return config;
  } catch (err) {
    Logger.error(
      'Unable to load config file. Please read https://astroneer.dev/docs/overview#astroneer-config to see more details.',
    );
    throw err;
  }
}
