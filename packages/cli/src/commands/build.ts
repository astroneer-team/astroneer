import { createFile } from '@astroneer/common';
import {
  AstroneerConfig,
  CONFIG,
  DIST_FOLDER,
  scan,
  SOURCE_FOLDER,
} from '@astroneer/core';
import { Command } from 'commander';
import path from 'path';
import { rimraf } from 'rimraf';
import { compile } from '../compiler';
import { printVersion } from '../helpers/print-version';
import { showSpinnerWithPromise } from '../helpers/show-spinner';

/**
 * Builds the project by compiling TypeScript files and creating the output files.
 * @returns {Promise<void>} A promise that resolves when the build process is complete.
 */
export async function build(): Promise<void> {
  const dist = await DIST_FOLDER();
  const config = await CONFIG();
  await printVersion();
  await rimraf(dist);
  await showSpinnerWithPromise(
    () => scanFiles(config),
    'Building Astroneer.js app',
  );
  createMainFile(dist);
}

async function scanFiles(config: AstroneerConfig): Promise<void> {
  await scan({
    rootDir: SOURCE_FOLDER,
    include: config.compiler.bundle
      ? [/\/?server\.ts$/, /\/routes(?:\/[^\/]+)*\/[^\/]+\.ts$/]
      : [/\/*.ts$/],
    exclude: [/\.d\.ts$/i, /\.spec\.(ts|js)$/i],
    onFile(file) {
      compile(file, config);
    },
  });
}

function createMainFile(dist: string): void {
  createFile({
    filePath: path.resolve(dist, 'main.js'),
    content: "require('./server').default();",
    overwrite: true,
  });
}

const buildCmd = new Command('build')
  .description('Build Astroneer.js app for production')
  .action(build);

export default buildCmd;
