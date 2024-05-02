import { ASTRONEER_DIST_FOLDER } from '@astroneer/core';
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
      await build();
      const serverModule = await import(
        path.resolve(process.cwd(), ASTRONEER_DIST_FOLDER, 'server.js')
      );

      if (!isAsyncFunction(serverModule.default)) {
        console.error(
          picocolors.red(
            'Server module must export default an async function that returns a `http.Server` instance',
          ),
        );
      }

      const server: Server = await serverModule.default(
        Number(options.port),
        options.hostname,
        options.devmode,
      );

      server.once('error', (err) => {
        console.error(err);
        process.exit(1);
      });

      server.listen(Number(options.port), options.hostname, () => {
        console.log(
          picocolors.green(
            `   ✔  Server listening on http://${options.hostname}:${options.port}\n`,
          ),
        );
      });
    },
  );

export default devCmd;
