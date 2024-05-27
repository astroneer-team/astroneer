import { spawnSync } from 'child_process';
import outputDirPath from '../output-dir-path';
import outputFilePath from '../output-file-path';

export default function withNCC(files: string[]) {
  return files.map((file) => {
    const now = Date.now();
    const nccArgs = ['build', file, '-t', '-q', '-o', outputDirPath(file)];

    const nccProcess = spawnSync(
      'ncc',
      nccArgs.filter((arg) => arg.length > 0),
      {
        stdio: 'inherit',
        shell: true,
      },
    );

    if (nccProcess.status !== 0) {
      throw new Error('Failed to compile files using ncc.');
    }

    return {
      file,
      output: outputFilePath(file),
      time: Date.now() - now,
    };
  });
}
