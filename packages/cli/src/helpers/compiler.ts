import { Logger } from '@astroneer/common';
import { AstroneerConfig, SOURCE_FOLDER } from '@astroneer/core';
import * as swc from '@swc/core';
import builder from 'esbuild';
import { mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import path, { resolve } from 'path';
import picocolors from 'picocolors';
import ts from 'typescript';

/**
 * Compiles a file using the specified configuration.
 * @param file - The file to compile.
 * @param config - The Astroneer configuration.
 */
export async function compile(files: string[], config: AstroneerConfig) {
  await Promise.all(files.map((file) => compileFile(file, config)));
}

/**
 * Compiles a file using the specified configuration.
 * @param file - The path of the file to compile.
 * @param config - The Astroneer configuration.
 */
export async function compileFile(file: string, config: AstroneerConfig) {
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
      await builder.build({
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

      await writeFile(outfile, code);
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
