import {
  PROTON_DIST_FOLDER,
  SERVER_MODULE_PATH,
  SOURCE_FOLDER,
} from '@protonjs/core';
import { watch } from 'chokidar';
import { Command } from 'commander';
import { Server } from 'http';
import path from 'path';
import picocolors from 'picocolors';
import { isAsyncFunction } from 'util/types';
import { build } from './build';

const devCmd = new Command('dev')
  .description('Start Proton.js app in development mode with hot reloading')
  .option('-p, --port <port>', 'Port to run the server on', '3000')
  .option(
    '-h, --hostname <hostname>',
    'Hostname to run the server on',
    'localhost',
  )
  .action(async (options: { port: string; hostname: string }) => {
    let server: Server;

    const start = async () => {
      process.env.NODE_ENV = 'development';
      console.clear();
      server?.close();
      await build();
      delete require.cache[require.resolve(SERVER_MODULE_PATH)];
      const newServerModule = await import(SERVER_MODULE_PATH);

      if (!isAsyncFunction(newServerModule.default)) {
        console.error(
          picocolors.red(
            '   ✖  Server module must export default an async function that returns a `http.Server` instance',
          ),
        );
        return;
      }

      server = await newServerModule.default(
        Number(options.port),
        options.hostname,
        true,
      );
    };

    watch(path.join(SOURCE_FOLDER, '**/*.ts'), {
      ignoreInitial: true,
      ignored: [
        path.resolve(process.cwd(), PROTON_DIST_FOLDER),
        path.resolve(process.cwd(), 'node_modules'),
      ],
    }).on('all', () => start());

    await start();
  });

export default devCmd;
