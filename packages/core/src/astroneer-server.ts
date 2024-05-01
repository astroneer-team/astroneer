import { IncomingMessage, Server, ServerResponse } from 'http';
import path from 'path';
import { rimraf } from 'rimraf';
import { UrlWithParsedQuery } from 'url';
import { AstroneerRouter } from './astroneer-router';
import { ASTRONEER_DIST_FOLDER } from './constants';

export type AstroneerServerOptions = {
  devmode: boolean;
  hostname: string;
  port: number;
  router: AstroneerRouter;
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

  get router() {
    return this.options.router;
  }

  get hostname() {
    return this.options.hostname;
  }

  get port() {
    return this.options.port;
  }

  useModule(module: AstroneerModule) {
    if (
      this.modules.every(
        (m) => Object.getPrototypeOf(m) === Object.getPrototypeOf(module),
      )
    )
      return;

    this.modules.push(module);
  }

  async prepare() {
    try {
      await rimraf(path.resolve(process.cwd(), ASTRONEER_DIST_FOLDER));
      await Promise.all(this.modules.map((m) => m.load(this)));
      await this.router.scan();
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  }

  async handle(
    req: IncomingMessage,
    res: ServerResponse,
    parsedUrl: UrlWithParsedQuery,
  ) {
    const route = await this.router.match(req.method!, parsedUrl.pathname!);

    console.log(route);
  }
}
