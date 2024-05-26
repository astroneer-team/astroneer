import { CONFIG_FILE, DIST_FOLDER, SOURCE_FOLDER } from '@astroneer/core';
import { watch } from 'chokidar';
import { Command } from 'commander';
import { configDotenv } from 'dotenv';
import { Server } from 'http';
import path, { resolve } from 'path';
import { startServer } from '../helpers/start-server';
import { build } from './build';
import { Logger } from '@astroneer/common';

/**
 * Starts the development server.
 *
 * @param options - The server options including the port and hostname.
 */
export async function devServer() {
  let server: Server;

  const watcher = watch([resolve(SOURCE_FOLDER, '**/*.ts'), CONFIG_FILE], {
    ignoreInitial: true,
    ignored: [
      path.resolve(process.cwd(), DIST_FOLDER),
      path.resolve(process.cwd(), 'node_modules'),
    ],
  }).on('change', async () => {
    try {
      delete require.cache[resolve(CONFIG_FILE)];
      await build();

      configDotenv({
        path: resolve('.env'),
        override: true,
      });

      if (server) {
        server.close();
      }

      server = await startServer();
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
const devCmd = new Command('dev')
  .description('Start Astroneer.js app in development mode with hot reloading')
  .option('-p, --port <port>', 'Port to run the server on', '3000')
  .option(
    '-h, --hostname <hostname>',
    'Hostname to run the server on',
    'localhost',
  )
  .action(async (options: { port: string; hostname: string }) => {
    process.env.ASTRONEER_CONTEXT = 'dev';
    process.env.NODE_ENV = 'development';
    process.env.PORT = options.port;
    process.env.HOSTNAME = options.hostname;
    await devServer();
  });

export default devCmd;
