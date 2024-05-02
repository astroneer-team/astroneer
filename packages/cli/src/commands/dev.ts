import { ASTRONEER_DIST_FOLDER } from '@astroneer/core';
import { Command } from 'commander';
import path from 'path';
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
      const server = await import(
        path.resolve(process.cwd(), ASTRONEER_DIST_FOLDER, 'server.js')
      );
      server.default(Number(options.port), options.hostname, options.devmode);
    },
  );

export default devCmd;
