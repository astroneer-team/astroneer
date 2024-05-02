import { ASTRONEER_DIST_FOLDER, SOURCE_FOLDER } from '@astroneer/core';
import { watch } from 'chokidar';
import { Command } from 'commander';
import { Server } from 'http';
import path from 'path';
import picocolors from 'picocolors';
import { isAsyncFunction } from 'util/types';
import { build } from './build';

const devCmd = new Command('dev')
  .description('Start Astroneer app in development mode with hot reloading')
  .option('-p, --port <port>', 'Port to run the server on', '3000')
  .option(
    '-h, --hostname <hostname>',
    'Hostname to run the server on',
    'localhost',
  )
  .option('-d, --devmode', 'Enable development mode', true)
  .action(
    async (options: { port: string; hostname: string; devmode: boolean }) => {
      console.clear();
      await build();
      let serverModulePath = path.resolve(
        process.cwd(),
        ASTRONEER_DIST_FOLDER,
        'server.js',
      );
      const serverModule = await import(serverModulePath);

      if (!isAsyncFunction(serverModule.default)) {
        console.error(
          picocolors.red(
            'Server module must export default an async function that returns a `http.Server` instance',
          ),
        );
      }

      let server: Server = await serverModule.default(
        Number(options.port),
        options.hostname,
        options.devmode,
      );

      watch(path.resolve(process.cwd(), SOURCE_FOLDER, '**/*.ts'), {
        ignoreInitial: true,
        ignored: [
          path.resolve(process.cwd(), ASTRONEER_DIST_FOLDER),
          path.resolve(process.cwd(), 'node_modules'),
        ],
      }).on('all', async (e) => {
        console.clear();
        server.close();
        await build();
        delete require.cache[require.resolve(serverModulePath)];
        const newServerModule = await import(serverModulePath);
        server = await newServerModule.default(
          Number(options.port),
          options.hostname,
          options.devmode,
        );
      });
    },
  );

export default devCmd;
