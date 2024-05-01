import { IncomingMessage, ServerResponse } from 'http';
import path from 'path';
import { rimraf } from 'rimraf';
import { UrlWithParsedQuery } from 'url';
import { AstroneerRequest } from './astroneer-request';
import { AstroneerResponse } from './astroneer-response';
import { AstroneerRouter } from './astroneer-router';
import { ASTRONEER_DIST_FOLDER } from './constants';

export type AstroneerServerOptions = {
  devmode: boolean;
  hostname: string;
  port: number;
  router: AstroneerRouter;
};

export type AstroneerModule = {
  load: (server: Astroneer) => Promise<void>;
};

export class Astroneer {
  private options: AstroneerServerOptions;

  constructor(options: AstroneerServerOptions) {
    this.options = options;
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

  async prepare() {
    try {
      await rimraf(path.resolve(process.cwd(), ASTRONEER_DIST_FOLDER));
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
    const route = await this.router.match(
      req.method as any,
      parsedUrl.pathname!,
    );

    if (!route?.handler) {
      res.statusCode = 404;
      res.end('Not Found');
      return;
    }

    const astroneerRequest = new AstroneerRequest(req);
    const astroneerResponse = new AstroneerResponse(res);

    if (route.middlewares?.length) {
      await Promise.all([
        route.middlewares.map(
          (middleware) =>
            new Promise<void>((resolve) => {
              middleware(astroneerRequest, astroneerResponse, resolve);
            }),
        ),
      ]);
    }

    await route.handler?.(astroneerRequest, astroneerResponse);
  }
}

export function astroneer({
  devmode,
  hostname,
  port,
}: {
  devmode: boolean;
  hostname: string;
  port: number;
}) {
  const router = new AstroneerRouter({
    devmode,
    routesDir: 'routes',
  });

  const app = new Astroneer({
    devmode,
    hostname,
    port,
    router,
  });

  return app;
}
