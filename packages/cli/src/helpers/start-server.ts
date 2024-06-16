import { DIST_FOLDER } from '@astroneer/config';
import { spawn } from 'child_process';
import path from 'path';

export type ServerProcess = {
  pid?: number;
};

export async function startServer(): Promise<ServerProcess> {
  const serverFunctionPath = path.resolve(DIST_FOLDER, 'server.js');
  const server_process = spawn(`node ${serverFunctionPath}`, {
    env: process.env,
    cwd: process.cwd(),
    shell: true,
    stdio: 'inherit',
  });

  return {
    pid: server_process.pid,
  };
}
