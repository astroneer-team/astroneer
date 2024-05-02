import { ASTRONEER_DIST_FOLDER, SOURCE_FOLDER } from '@astroneer/core';
import builder from 'esbuild';
import path from 'path';

export async function compile(file: string) {
  const relativePath = path.relative(
    SOURCE_FOLDER,
    file.replace(/\.(j|t)s?$/, '.js'),
  );

  const outfile = path.resolve(ASTRONEER_DIST_FOLDER, relativePath);

  await builder.build({
    entryPoints: [file],
    bundle: true,
    format: 'cjs',
    platform: 'node',
    outfile,
  });

  return outfile;
}
