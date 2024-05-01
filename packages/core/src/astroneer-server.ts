import { createServer, Server } from 'http';
import { parse } from 'url';
import { AstroneerError } from './errors/astroneer-error';

export type AstroneerServerOptions = {
  hostname: string;
  port: number;
};

export type AstroneerModule = {
  load: (server: AstroneerServer) => Promise<void>;
};

export class AstroneerServer {
  private server?: Server;
  private options: AstroneerServerOptions;
  private modules: AstroneerModule[];

  constructor(options: AstroneerServerOptions) {
    this.options = options;
    this.modules = [];
  }

  get hostname() {
    return this.options.hostname;
  }

  get port() {
    return this.options.port;
  }

  async prepare() {
    await Promise.all(this.modules.map((m) => m.load(this)));

    this.server = createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url || '', true);
        const { pathname, query } = parsedUrl;
      } catch (err) {
        console.error('Error occurred while handling request:', req.url, err);
        res.statusCode = 500;
        res.end();
      }
    }).once('error', (err) => {
      console.error(err);
      process.exit(1);
    });
  }

  async start() {
    if (!this.server) throw new AstroneerError('Server not prepared');

    this.server.listen(this.port, this.hostname, () => {
      console.log(`Server running at http://${this.hostname}:${this.port}/`);
    });
  }
}
