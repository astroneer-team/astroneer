import { loadConfig } from '@astroneer/config';
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
 * @param files
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
}
