import { SERVER_MODULE_PATH } from '@astroneer/core';
import { Server } from 'http';

export async function startServer() {
  const server: Server = await import(SERVER_MODULE_PATH).then((m) =>
    m.default(),
  );

  return server;
}
