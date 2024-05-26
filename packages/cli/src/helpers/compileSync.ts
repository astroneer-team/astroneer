import { Logger } from '@astroneer/common';
import { AstroneerConfig, SOURCE_FOLDER } from '@astroneer/config';
import path from 'path';
import picocolors from 'picocolors';
import withTSC from './compilers/with-tsc';

/**
 * Compiles a file using the specified configuration.
 * @param file - The file to compile.
 * @param config - The Astroneer configuration.
 */
export default function compileSync(files: string[], config: AstroneerConfig) {
  const now = Date.now();
  const relativePaths = files.map((file) =>
    path.relative(SOURCE_FOLDER, file.replace(/\.(j|t)s?$/, '.js')),
  );

  try {
    switch (config.compiler?.type) {
      case 'tsc':
        withTSC(files);
        break;
    }

    relativePaths.forEach((relativePath) => {
      Logger.log(
        `${picocolors.blue('✔')} ${picocolors.gray(relativePath.replaceAll(/\\/g, '/'))} ${picocolors.blue(
          `(${Date.now() - now}ms)`,
        )}`,
      );
    });
  } catch (err) {
    relativePaths.forEach((relativePath) => {
      Logger.error(
        `${picocolors.red('✖')} ${picocolors.gray(relativePath.replaceAll(/\\/g, '/'))} ${picocolors.red(
          `(${Date.now() - now}ms)`,
        )}`,
      );
    });

    throw err;
  }
}
