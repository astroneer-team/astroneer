import * as swc from '@swc/core';
import fs from 'fs';
import path from 'path';
import outputFilePath from '../output-file-path';
import { dirExists } from '@astroneer/common';

export default function withSWC(files: string[]) {
  const swcrcFileExists = fs.existsSync(path.resolve(process.cwd(), '.swcrc'));

  if (!swcrcFileExists) {
    throw new Error(
      'SWC configuration file (.swcrc) not found. Please create a .swcrc file in the root of your project.',
    );
  }

  return files.map((file) => {
    const now = Date.now();
    const { code } = swc.transformFileSync(file, {
      swcrc: true,
      cwd: process.cwd(),
    });

    const output = outputFilePath(file);

    if (!dirExists(path.dirname(output))) {
      fs.mkdirSync(path.dirname(output), { recursive: true });
    }

    fs.writeFileSync(output, code);

    return {
      file,
      output,
      time: Date.now() - now,
    };
  });
}
