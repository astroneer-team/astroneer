import {
  DIST_FOLDER,
  SERVER_MODULE_PATH,
  SOURCE_FOLDER,
} from '@astroneer/core';
import { watch } from 'chokidar';
import { Command } from 'commander';
import { Server } from 'http';
import path from 'path';
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
    let server: Server;
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

      Object.assign(process.env, env);

      const start = async () => {
        server = await import(SERVER_MODULE_PATH).then((m) => m.default());
      };

      if (!server?.listening) {
        return await start();
      }

      server.close(() => {
        start();
      });
    });

    watcher.emit('all');
  });

export default devCmd;
