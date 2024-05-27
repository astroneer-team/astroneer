import { Logger } from '@astroneer/common';
import { loadConfig, SOURCE_FOLDER } from '@astroneer/config';
import path from 'path';
import picocolors from 'picocolors';
import withSWC from './compilers/with-swc';
import withTSC from './compilers/with-tsc';
import { typeCheck } from './type-check';

type CompilationResult = {
  output: string;
  time: number;
  file: string;
}[];

/**
 * Compiles a file using the specified configuration.
 * @param file - The file to compile.
 * @param config - The Astroneer configuration.
 */
export default function compileSync(files: string[]) {
  const config = loadConfig();
  const results: CompilationResult = [];

  switch (config.compiler?.type) {
    case 'swc':
      if (config.compiler.typeCheck) {
        typeCheck();
      }
      results.push(...withSWC(files));
      break;
    case 'tsc':
      if (config.compiler.typeCheck) {
        typeCheck();
      }
      results.push(...withTSC(files));
      break;
  }

  results.forEach((result) => {
    const relativePath = path.relative(SOURCE_FOLDER, result.file);
    Logger.log(
      `${picocolors.blue('✔')} ${picocolors.gray(`${relativePath}`)} ${picocolors.blue(`(${result.time}ms)`)}`,
    );
  });
}
