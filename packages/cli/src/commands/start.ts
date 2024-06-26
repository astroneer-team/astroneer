import { Logger } from '@astroneer/common';
import { DIST_FOLDER } from '@astroneer/config';
import { Command } from 'commander';
import { configDotenv } from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { startServer } from '../helpers/start-server';

/**
 * Command to start Astroneer.js app.
 */
export const startCmd = new Command('start')
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
      process.env.HOST = options.hostname;

      configDotenv({
        path: resolve('.env'),
        override: true,
      });

      if (!existsSync(DIST_FOLDER)) {
        Logger.error(
          'Could not find the output folder in the current directory. Do you forget to run `astroneer build`?',
        );
        process.exit(1);
      }

      await startServer();
    },
  );
