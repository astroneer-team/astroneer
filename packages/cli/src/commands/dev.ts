import { CONFIG_FILE, DIST_FOLDER, SOURCE_FOLDER } from '@astroneer/core';
import { watch } from 'chokidar';
import { Command } from 'commander';
import { configDotenv } from 'dotenv';
import { Server } from 'http';
import path, { resolve } from 'path';
import { build } from './build';

const devCmd = new Command('dev')
  .description('Start Astroneer.js app in development mode with hot reloading')
  .option('-p, --port <port>', 'Port to run the server on', '3000')
  .option(
    '-h, --hostname <hostname>',
    'Hostname to run the server on',
    'localhost',
  )
  .action(async (options: { port: string; hostname: string }) => {
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

      configDotenv({
        processEnv: {
          NODE_ENV: 'development',
          PORT: options.port,
          HOSTNAME: options.hostname,
        },
        path: [resolve(process.cwd(), '.env')],
        override: true,
      });

      const start = async () => {
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
  });

export default devCmd;
