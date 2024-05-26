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
import { compile } from '../helpers/compiler';
import { printVersion } from '../helpers/print-version';

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
  const config = await CONFIG();
  await printVersion();
  await rimraf(DIST_FOLDER);
  await scanFiles(config);
  createMainFile(DIST_FOLDER);
  createConfigFile(DIST_FOLDER, config);
}

async function scanFiles(config: AstroneerConfig): Promise<void> {
  const files: string[] = [];
  await scan({
    rootDir: SOURCE_FOLDER,
    include: config.compiler.bundle
      ? [/\/?server\.ts$/, /\/routes(?:\/[^\/]+)*\/[^\/]+\/*.ts$/]
      : [/\/*.ts$/],
    exclude: [/\/*.d\.ts$/i, /\/*.spec\.(ts|js)$/i],
    onFile(file) {
      files.push(file);
    },
  });

  await compile(files, config);
}

function createMainFile(dist: string): void {
  createFile({
    filePath: path.resolve(dist, 'main.js'),
    content: "require('./server').default();",
    overwrite: true,
  });
}

function createConfigFile(dist: string, config: AstroneerConfig): void {
  createFile({
    filePath: path.resolve(dist, 'astroneer.config.json'),
    content: JSON.stringify(config, null, 2),
    overwrite: true,
  });
}

const buildCmd = new Command('build')
  .description('Build Astroneer.js app for production')
  .action(async () => {
    process.env.ASTRONEER_CONTEXT = 'build';
    process.env.NODE_ENV = 'production';
    try {
      await build();
    } catch (err) {
      process.exit(1);
    }
  });

export default buildCmd;
