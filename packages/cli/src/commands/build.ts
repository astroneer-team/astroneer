import { createFile, Logger } from '@astroneer/common';
import { DIST_FOLDER, scan, SOURCE_FOLDER } from '@astroneer/core';
import { Command } from 'commander';
import path from 'path';
import picocolors from 'picocolors';
import { rimraf } from 'rimraf';
import { compile } from '../compiler';
import { printVersion } from '../helpers/print-version';

export async function build() {
  const logger = new Logger();

  await printVersion();
  await rimraf(DIST_FOLDER);

  const tsFiles: string[] = [];

  await scan({
    rootDir: SOURCE_FOLDER,
    include: [/\.ts?$/i],
    onFile(file) {
      tsFiles.push(file);
    },
  });

  const promises = tsFiles.map(async (file) => {
    const start = Date.now();
    const outFile = await compile(file).then((res) =>
      path.relative(process.cwd(), res),
    );

    logger.log(
      `${picocolors.blue('✔')} ${picocolors.gray(outFile)} ${picocolors.blue(`(${Date.now() - start}ms)`)}`,
    );
  });

  await Promise.all(promises);

  createFile({
    filePath: path.resolve(DIST_FOLDER, 'main.js'),
    content: "require('./server').default();",
    overwrite: true,
  });
}

const buildCmd = new Command('build')
  .description('Build Astroneer.js app for production')
  .action(build.bind(null));

export default buildCmd;
