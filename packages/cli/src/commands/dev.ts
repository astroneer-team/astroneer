import { DIST_FOLDER, SOURCE_FOLDER } from '@astroneer/core';
import { watch } from 'chokidar';
import { Command } from 'commander';
import { Server } from 'http';
import path from 'path';
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
    let server: Server;
    const watcher = watch(path.join(SOURCE_FOLDER, '**/*.ts'), {
      ignoreInitial: true,
      ignored: [
        path.resolve(process.cwd(), DIST_FOLDER),
        path.resolve(process.cwd(), 'node_modules'),
      ],
    }).on('all', async () => {
      process.env.NODE_ENV = 'development';
      console.clear();
      await build();
      if (server) server.close();
      server = await startServer(Number(options.port), options.hostname);
    });

    watcher.emit('all');
  });

export default devCmd;
