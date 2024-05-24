import { CONFIG_FILE, DIST_FOLDER, SOURCE_FOLDER } from '@astroneer/core';
import { watch } from 'chokidar';
import { Command } from 'commander';
import { configDotenv } from 'dotenv';
import { Server } from 'http';
import path, { resolve } from 'path';
import { build } from './build';

/**
 * Starts the development server.
 *
 * @param options - The server options including the port and hostname.
 */
export async function devServer(options: { port: string; hostname: string }) {
  let server: Server;
  const dist = await DIST_FOLDER();
  const watcher = watch([resolve(SOURCE_FOLDER, '**/*.ts'), CONFIG_FILE], {
    ignoreInitial: true,
    ignored: [
      path.resolve(process.cwd(), dist),
      path.resolve(process.cwd(), 'node_modules'),
    ],
  }).on('all', async () => {
    delete require.cache[resolve(CONFIG_FILE)];

    await build();

    process.env.NODE_ENV = 'development';
    process.env.PORT = options.port;
    process.env.HOST = options.hostname;

    configDotenv({
      path: resolve('.env'),
      override: true,
    });

    const start = async () => {
      delete require.cache[resolve(dist, 'server.js')];
      server = await import(resolve(dist, 'server.js')).then((m) =>
        m.default(),
      );
    };

    if (!server?.listening) {
      return await start();
    }

    server.close(() => {
      start();
    });
  });

  watcher.emit('all');
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
    '0.0.0.0',
  )
  .action(devServer);

export default devCmd;
