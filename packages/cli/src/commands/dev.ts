import {
  DIST_FOLDER,
  SERVER_MODULE_PATH,
  SOURCE_FOLDER,
} from '@astroneer/core';
import { watch } from 'chokidar';
import { Command } from 'commander';
import { Server } from 'http';
import path from 'path';
import picocolors from 'picocolors';
import { isAsyncFunction } from 'util/types';
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

    const start = async () => {
      process.env.NODE_ENV = 'development';
      console.clear();
      server?.close();
      await build();
      const newServerModule = await import(SERVER_MODULE_PATH);

      if (!isAsyncFunction(newServerModule.default)) {
        console.error(
          picocolors.red(
            '   ✖  Server module must export default an async function',
          ),
        );

        process.exit(1);
      }

      server = await newServerModule.default(
        Number(options.port),
        options.hostname,
        true,
      );

      if (!(server instanceof Server)) {
        console.error(
          picocolors.red(
            '   ✖  The default exports of the `server.ts` must return an instance of `http.Server`. Please refer to https://astroneer.dev/docs/server for more information.',
          ),
        );
        process.exit(1);
      }
    };

    watch(path.join(SOURCE_FOLDER, '**/*.ts'), {
      ignoreInitial: true,
      ignored: [
        path.resolve(process.cwd(), DIST_FOLDER),
        path.resolve(process.cwd(), 'node_modules'),
      ],
    }).on('all', () => start());

    await start();
  });

export default devCmd;
