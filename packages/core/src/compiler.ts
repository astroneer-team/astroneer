import * as swc from '@swc/core';
import path from 'path';
import { ASTRONEER_DIST_FOLDER } from './constants';

export async function compileTsFile(fileName: string) {
  const { code } = await swc.transformFile(fileName, {
    jsc: {
      parser: {
        syntax: 'typescript',
      },
      target: 'esnext',
    },
    module: {
      type: 'commonjs',
    },
  });

  return code;
}
