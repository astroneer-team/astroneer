import * as swc from '@swc/core';
import fs from 'fs';
import path from 'path';
import outputFilePath from '../output-file-path';

export default function withSWC(file: string) {
  const swcrcFileExists = fs.existsSync(path.resolve(process.cwd(), '.swcrc'));

  if (!swcrcFileExists) {
    throw new Error(
      'SWC configuration file (.swcrc) not found. Please create a .swcrc file in the root of your project.',
    );
  }

  const { code } = swc.transformFileSync(file, {
    swcrc: true,
    cwd: process.cwd(),
  });

  const output = outputFilePath(file);

  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, code);
}
