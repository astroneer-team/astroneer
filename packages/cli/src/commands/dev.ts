import { DIST_FOLDER, SOURCE_FOLDER } from '@astroneer/core';
import { ChildProcess } from 'child_process';
import { watch } from 'chokidar';
import { Command } from 'commander';
import path from 'path';
import treeKill from 'tree-kill';
import { startServer } from '../helpers/start-server';
import { build } from './build';

const devCmd = new Command('dev')
  .description('Start Astroneer.js app in development mode with hot reloading')
  .option('-p, --port <port>', 'Port to run the server on', '3000')
  .option(
    '-h, --hostname <hostname>',
    'Hostname to run the server on',
    'localhost',
  )
  .action(async (options: { port: string; hostname: string }) => {
    let cp: ChildProcess;
    const watcher = watch(path.join(SOURCE_FOLDER, '**/*.ts'), {
      ignoreInitial: true,
      ignored: [
        path.resolve(process.cwd(), DIST_FOLDER),
        path.resolve(process.cwd(), 'node_modules'),
      ],
    }).on('all', async () => {
      console.clear();
      await build();

      const env = {
        ...process.env,
        NODE_ENV: 'development',
        PORT: options.port,
        HOST: options.hostname,
      };

      const start = async () => {
        cp = await startServer(Number(options.port), options.hostname, env);
      };

      if (!cp?.pid) return start();

      treeKill(cp.pid, 'SIGTERM', async (err) => {
        if (err) throw err;
        await start();
      });
    });

    watcher.emit('all');
  });

export default devCmd;
