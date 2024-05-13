import { SOURCE_FOLDER } from '@astroneer/core';
import { ChildProcess, exec } from 'child_process';
import { resolve } from 'path';
import treeKill from 'tree-kill';

export class Test {
  private constructor() {}

  static createServer() {
    let cp: ChildProcess;

    const start = async () => {
      cp = exec(`ts-node ${resolve(SOURCE_FOLDER)}/server.ts`);
    };

    const stop = () => {
      if (cp.pid) treeKill(cp.pid, 'SIGTERM');
    };

    return { start, stop };
  }
}
