import { Logger } from '@astroneer/common';
import { DIST_FOLDER } from '@astroneer/core';
import { Server } from 'http';
import path from 'path';
import { isAsyncFunction } from 'util/types';

export async function startServer(): Promise<Server> {
  const serverFunctionPath = path.resolve(DIST_FOLDER, 'server.js');
  delete require.cache[serverFunctionPath];
  const startServer = await import(serverFunctionPath).then((m) => m.default);

  if (!isAsyncFunction(startServer)) {
    Logger.error('The default export of server file must be an async function');
    process.exit(1);
  }

  const server = await startServer();

  if (!(server instanceof Server)) {
    Logger.error(
      'The default export of server file must return an instance of http.Server',
    );

    process.exit(1);
  }

  return server;
}
