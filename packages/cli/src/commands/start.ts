import { Logger } from '@astroneer/common';
import { DIST_FOLDER } from '@astroneer/core';
import { Command } from 'commander';
import { existsSync } from 'fs';
import { startServer } from '../helpers/start-server';

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
      process.env.NODE_ENV = options.devmode ? 'development' : 'production';
      if (!existsSync(DIST_FOLDER)) {
        Logger.error(
          'Could not find the .astroneer folder in the current directory. Do you forget to run `astroneer build`?',
        );
        process.exit(1);
      }
      console.clear();
      startServer(Number(options.port), options.hostname);
    },
  );

export default startCmd;
