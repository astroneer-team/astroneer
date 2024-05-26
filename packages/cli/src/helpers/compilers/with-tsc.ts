import { spawnSync } from 'child_process';
import ts from 'typescript';
import outputFilePath from '../output-file-path';

export default function withTSC(files: string[]) {
  const tsconfig = ts.readConfigFile('tsconfig.json', ts.sys.readFile).config;

  const tscArgs = ['--noEmit', '--project', 'tsconfig.json'];
  const tscProcess = spawnSync('tsc', tscArgs, {
    stdio: 'inherit',
    shell: true,
  });

  if (tscProcess.status !== 0) {
    throw new Error('Type checking failed');
  }

  files.forEach((file) => {
    const { outputText } = ts.transpileModule(ts.sys.readFile(file) ?? '', {
      compilerOptions: tsconfig.compilerOptions,
      fileName: file,
    });

    ts.sys.writeFile(outputFilePath(file), outputText);
  });
}
