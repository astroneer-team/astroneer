import * as swc from '@swc/core';

/**
 * Compile a TypeScript file to JavaScript.
 * @param fileName The name of the file to compile.
 * @returns A promise that resolves with the compiled code.
 */
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
