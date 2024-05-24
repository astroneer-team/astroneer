import { Logger } from '@astroneer/common';
import { AstroneerConfig, SOURCE_FOLDER } from '@astroneer/core';
import * as swc from '@swc/core';
import builder from 'esbuild';
import { mkdirSync, writeFileSync } from 'fs';
import path, { resolve } from 'path';
import picocolors from 'picocolors';
import ts from 'typescript';

/**
 * Compiles a file using the specified configuration.
 * @param file - The file to compile.
 * @param config - The Astroneer configuration.
 */
export function compile(file: string, config: AstroneerConfig) {
  const now = Date.now();
  const relativePath = path.relative(
    SOURCE_FOLDER,
    file.replace(/\.(j|t)s?$/, '.js'),
  );

  const outfile = path.resolve(config.outDir, relativePath);
  const { compilerOptions } = ts.readConfigFile(
    resolve('tsconfig.json'),
    ts.sys.readFile,
  ).config;

  mkdirSync(path.dirname(outfile), { recursive: true });

  switch (config.compiler.type) {
    case 'esbuild':
      builder.buildSync({
        entryPoints: [file],
        bundle: !!config.compiler.bundle,
        format: 'cjs',
        platform: 'node',
        outfile,
        minify: true,
        minifyWhitespace: true,
        minifySyntax: true,
        minifyIdentifiers: true,
        tsconfig: path.resolve(process.cwd(), 'tsconfig.json'),
        external:
          typeof config.compiler.bundle === 'object'
            ? config.compiler.bundle.externalModules
            : [],
      });
      break;
    case 'swc':
      const { code } = swc.transformFileSync(file, {
        jsc: {
          target: compilerOptions?.target?.toLowerCase() ?? 'esnext',
        },
        module: {
          type: compilerOptions?.module ?? 'commonjs',
        },
      });

      writeFileSync(outfile, code);
      break;
    default:
      Logger.error(`Unsupported compiler type: ${config.compiler.type}`);
      process.exit(1);
  }

  Logger.log(
    `${picocolors.blue('✔')} ${picocolors.gray(relativePath)} ${picocolors.blue(
      `(${Date.now() - now}ms)`,
    )}`,
  );
}
