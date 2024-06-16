import { Logger } from '@astroneer/common';
import {
  CONFIG_FILE_NAMES,
  DIST_FOLDER,
  SOURCE_FOLDER,
} from '@astroneer/config';
import { watch } from 'chokidar';
import { Command } from 'commander';
import { configDotenv } from 'dotenv';
import path, { resolve } from 'path';
import treeKill from 'tree-kill';
import { ServerProcess, startServer } from '../helpers/start-server';
import { build } from './build';

/**
 * Starts the development server.
 */
export async function devServer() {
  let server: ServerProcess;

  const watcher = watch(
    [resolve(SOURCE_FOLDER, '**/*.ts'), ...CONFIG_FILE_NAMES],
    {
      ignoreInitial: true,
      ignored: [
        path.resolve(process.cwd(), DIST_FOLDER),
        path.resolve(process.cwd(), 'node_modules'),
      ],
    },
  ).on('change', async () => {
    try {
      CONFIG_FILE_NAMES.forEach((file) => {
        delete require.cache[resolve(file)];
      });

      await build();

      configDotenv({
        path: resolve('.env'),
        override: true,
      });

      if (server) {
        treeKill(server.pid as number, 'SIGTERM', async (err) => {
          if (err) {
            Logger.error(err.message);
          } else {
            server = await startServer();
          }
        });

        console.log();
      } else {
        server = await startServer();
      }
    } catch (err) {
      Logger.error(err.message);
    }
  });

  watcher.emit('change');
}

/**
 * Command to start Astroneer.js app in development mode with hot reloading.
 * @command dev
 */
export const devCmd = new Command('dev')
  .description('Start Astroneer.js app in development mode with hot reloading')
  .option('-p, --port <port>', 'Port to run the server on', '3000')
  .option(
    '-h, --hostname <hostname>',
    'Hostname to run the server on',
    'localhost',
  )
  .action(async (options: { port: string; hostname: string }) => {
    process.env.NODE_ENV = 'development';
    process.env.PORT = options.port;
    process.env.HOSTNAME = options.hostname;
    await devServer();
  });
