import { Logger } from '@astroneer/common';
import { DIST_FOLDER } from '@astroneer/core';
import { Command } from 'commander';
import { existsSync } from 'fs';
import { resolve } from 'path';

const startCmd = new Command('start')
  .description('Start Astroneer.js app')
  .option('-p, --port <port>', 'Port to run the server on', '3000')
  .option(
    '-h, --hostname <hostname>',
    'Hostname to run the server on',
    'localhost',
  )
  .option('-d, --devmode', 'Enable development mode', false)
  .action(
    async (options: { port: string; hostname: string; devmode: boolean }) => {
      const dist = await DIST_FOLDER();
      process.env.NODE_ENV = options.devmode ? 'development' : 'production';

      if (!existsSync(dist)) {
        Logger.error(
          'Could not find the .astroneer folder in the current directory. Do you forget to run `astroneer build`?',
        );
        process.exit(1);
      }

      await import(resolve(dist, 'server.js')).then((m) => m.default());
    },
  );

export default startCmd;
