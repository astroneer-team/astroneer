import * as swc from '@swc/core';

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
