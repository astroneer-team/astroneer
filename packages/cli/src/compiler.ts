import { ASTRONEER_DIST_FOLDER, SOURCE_FOLDER } from '@astroneer/core';
import builder from 'esbuild';
import path from 'path';

export async function compile(file: string) {
  const relativePath = path.relative(
    path.join(process.cwd(), SOURCE_FOLDER),
    file.replace(/\.(j|t)sx?$/, '.js'),
  );

  const outfile = path.resolve(
    process.cwd(),
    ASTRONEER_DIST_FOLDER,
    relativePath,
  );

  await builder.build({
    entryPoints: [file],
    bundle: true,
    format: 'cjs',
    platform: 'node',
    outfile,
  });

  return outfile;
}