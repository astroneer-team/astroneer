import { spawnSync } from 'child_process';

export function typeCheck() {
  const tscArgs = ['--noEmit', '--project', 'tsconfig.json'];
  const tscProcess = spawnSync('tsc', tscArgs, {
    stdio: 'inherit',
    shell: true,
  });

  if (tscProcess.status !== 0) {
    throw new Error('Failed to compile TypeScript files.');
  }
}
