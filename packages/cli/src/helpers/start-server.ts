import { SERVER_MODULE_PATH } from '@astroneer/core';
import { exec } from 'child_process';

export async function startServer(
  port: number,
  hostname: string,
  env: Record<string, string> = {},
) {
  const cp = exec(
    `node ${SERVER_MODULE_PATH} --port ${port} --hostname ${hostname}`,
    {
      cwd: process.cwd(),
      env,
    },
  );

  cp.stdout?.pipe(process.stdout);
  cp.stderr?.pipe(process.stderr);

  return cp;
}
