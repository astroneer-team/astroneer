import { Logger } from '@astroneer/common';
import { Astroneer } from '@astroneer/core';
import { createServer, Server } from 'http';
import { parse } from 'url';

/**
 * Customize it to your needs, just make sure to prepare the app before starting launching rockets around the galaxy!
 */
export default async function astroneer(): Promise<Server> {
  const app = await Astroneer.prepare();
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url || '', true);
    app.handle(req, res, parsedUrl);
  });

  server.once('error', (err) => {
    Logger.error(err.message);
    process.exit(1);
  });

  server.listen(3000, '0.0.0.0', () => {
    Logger.log(`> Listening on http://localhost:3000`);
  });

  return server;
}
