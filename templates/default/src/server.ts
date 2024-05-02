import { Astroneer } from '@astroneer/core';
import { createServer, Server } from 'http';
import { parse } from 'url';

export default async function server(
  port: number,
  hostname: string,
  devmode: boolean,
): Promise<Server> {
  const app = new Astroneer();
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url || '', true);
      await app.handle(req, res, parsedUrl);
    } catch (err) {
      console.error(err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  server.once('error', (err) => {
    console.error(err);
    process.exit(1);
  });

  server.listen(Number(port), hostname, () => {
    console.log(`>  Server listening on http://${hostname}:${port}\n`);
  });

  return server;
}
