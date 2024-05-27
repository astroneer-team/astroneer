import ts from 'typescript';
import outputFilePath from '../output-file-path';

export default function withTSC(files: string[]) {
  const tsconfig = ts.readConfigFile('tsconfig.json', ts.sys.readFile).config;

  return files.map((file) => {
    const now = Date.now();
    const { outputText } = ts.transpileModule(ts.sys.readFile(file) ?? '', {
      compilerOptions: tsconfig.compilerOptions,
      fileName: file,
    });

    ts.sys.writeFile(outputFilePath(file), outputText);

    return {
      output: outputFilePath(file),
      time: Date.now() - now,
      file,
    };
  });
}
