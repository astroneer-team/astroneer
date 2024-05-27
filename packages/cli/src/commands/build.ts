import { DIST_FOLDER, SOURCE_FOLDER } from '@astroneer/config';
import { scanSync } from '@astroneer/scanner';
import { Command } from 'commander';
import { rimraf } from 'rimraf';
import compileSync from '../helpers/compileSync';
import { printVersion } from '../helpers/print-version';
import { Logger } from '@astroneer/common';

/**
 * Builds the project by compiling TypeScript files and creating the output files.
 * @returns {Promise<void>} A promise that resolves when the build process is complete.
 */
/**
 * Builds the Astroneer.js app.
 *
 * @returns A promise that resolves when the build process is complete.
 */
export async function build(): Promise<void> {
  await printVersion();
  await rimraf(DIST_FOLDER);
  scanFiles();
}

function scanFiles(): void {
  const files: string[] = [];

  scanSync({
    rootDir: SOURCE_FOLDER,
    searchFor: [/\/*.ts$/],
    ignore: [/\/*.d.ts$/, /\/*.test.ts$/, /\/*.spec.ts$/],
    onFile(file) {
      files.push(file);
    },
  });

  compileSync(files);
}

export const buildCmd = new Command('build')
  .description('Build Astroneer.js app for production')
  .action(async () => {
    process.env.NODE_ENV = 'production';

    try {
      await build();
    } catch (err) {
      Logger.error(err.message);
      process.exit(1);
    }
  });
