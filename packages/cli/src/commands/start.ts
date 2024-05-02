import { SERVER_MODULE_PATH } from '@protonjs/core';
import { Command } from 'commander';
import path from 'path';
import picocolors from 'picocolors';
import { isAsyncFunction } from 'util/types';
import { build } from './build';

const startCmd = new Command('start')
  .description('Start Proton.js app')
  .option('-p, --port <port>', 'Port to run the server on', '3000')
  .option(
    '-h, --hostname <hostname>',
    'Hostname to run the server on',
    'localhost',
  )
  .option('-d, --devmode', 'Enable development mode', false)
  .action(
    async (options: { port: string; hostname: string; devmode: boolean }) => {
      process.env.NODE_ENV = options.devmode ? 'development' : 'production';
      console.clear();
      await build();
      let serverModulePath = path.resolve(SERVER_MODULE_PATH);
      const serverModule = await import(serverModulePath);

      if (!isAsyncFunction(serverModule.default)) {
        console.error(
          picocolors.red(
            '   ✖  Server module must export default an async function that returns a `http.Server` instance',
          ),
        );
        return;
      }

      await serverModule.default(Number(options.port), options.hostname);
    },
  );

export default startCmd;
