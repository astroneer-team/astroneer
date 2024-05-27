import { spawnSync } from 'child_process';
import { Logger } from '@astroneer/common';
import picocolors from 'picocolors';

export function typeCheck() {
  const now = new Date();
  const tscArgs = [
    '--pretty',
    '--noEmit',
    '-p',
    `${process.cwd()}/tsconfig.json`,
  ];
  const tscProcess = spawnSync('tsc', tscArgs, {
    stdio: 'inherit',
    shell: true,
  });

  if (tscProcess.status !== 0) {
    throw new Error('Failed to compile TypeScript files.');
  }

  Logger.log(
    picocolors.blue(
      `✔ Type checking completed in ${Date.now() - now.getTime()}ms`,
    ),
  );
}
