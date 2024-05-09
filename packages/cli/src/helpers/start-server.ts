import { Logger } from '@astroneer/common';
import { SERVER_MODULE_PATH } from '@astroneer/core';
import { Server } from 'http';
import { isAsyncFunction } from 'util/types';

export async function startServer(port: number, hostname: string) {
  const logger = new Logger();
  const serverModuleInstance: {
    default: (port: number, host: string, devmode: boolean) => Promise<Server>;
  } = await import(SERVER_MODULE_PATH);

  if (!isAsyncFunction(serverModuleInstance.default)) {
    logger.error(
      'Server module must export default ans async function. Please refer to https://astroneer.dev/docs/server for more information.',
    );
  }

  const server = await serverModuleInstance.default(
    port,
    hostname,
    process.env.NODE_ENV === 'development',
  );

  if (!(server instanceof Server)) {
    logger.error(
      'The default exports of the `server.ts` must return an instance of `http.Server`. Please refer to https://astroneer.dev/docs/server for more information.',
    );
  }

  server.once('error', (err) => {
    logger.error(err.toString());
  });

  server.listen(port, hostname, () => {
    logger.log(`> Listening on $http://${hostname}:${port}`);
  });

  return server;
}
