import { scanSync } from '@astroneer/scanner';
import { CONFIG_FILE_REGEXS } from './constants';
import { AstroneerConfig } from './types';

export function loadConfig(): AstroneerConfig {
  let config: AstroneerConfig = {};

  scanSync({
    rootDir: process.cwd(),
    searchFor: CONFIG_FILE_REGEXS,
    onlyRootDir: true,
    onFile(filePath) {
      config = require(filePath);
    },
  });

  if (!Object.keys(config).length) {
    throw new Error(
      'Unable to load config file. Please read https://astroneer.dev/docs/overview#config to see more details.',
    );
  }

  return config;
}
