import { IncomingMessage, ServerResponse } from 'http';
import path from 'path';
import { rimraf } from 'rimraf';
import { UrlWithParsedQuery } from 'url';
import { AstroneerRequest } from './astroneer-request';
import { AstroneerResponse } from './astroneer-response';
import { AstroneerRouter } from './astroneer-router';
import { ASTRONEER_DIST_FOLDER } from './constants';

export type AstroneerServerOptions = {
  /**
   * Whether the server is running in development mode.
   */
  devmode: boolean;
  /**
   * The hostname of the server.
   */
  hostname: string;
  /**
   * The port of the server.
   */
  port: number;
  /**
   * The router for the server.
   */
  router: AstroneerRouter;
};

/**
 * The Astroneer application that processes incoming requests.
 */
export class Astroneer {
  /**
   * The options for the server.
   */
  private options: AstroneerServerOptions;

  constructor(options: AstroneerServerOptions) {
    this.options = options;
  }

  /**
   *  The router for the server.
   */
  get router() {
    return this.options.router;
  }

  /**
   * The hostname of the server.
   */
  get hostname() {
    return this.options.hostname;
  }

  /**
   * The port of the server.
   */
  get port() {
    return this.options.port;
  }

  /**
   * Prepare the server by scanning the routes directory.
   * This method should be called before starting the server.
   */
  async prepare() {
    try {
      // Clear the dist folder and scan the routes directory.
      await rimraf(path.resolve(process.cwd(), ASTRONEER_DIST_FOLDER));
      // Scan the routes directory.
      await this.router.scan();
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  }

  /**
   * Process an incoming request.
   * @param req The incoming request.
   * @param res The server response.
   * @param parsedUrl The parsed URL of the request.
   * @returns A promise that resolves when the request is handled.
   */
  async handle(
    req: IncomingMessage,
    res: ServerResponse,
    parsedUrl: UrlWithParsedQuery,
  ) {
    // Match the route for the request.
    const route = await this.router.match(
      req.method as any,
      parsedUrl.pathname!,
    );

    // If no route is found, return a 404 response.
    if (!route?.handler) {
      res.statusCode = 404;
      res.end('Not Found');
      return;
    }

    const astroneerRequest = new AstroneerRequest(req);
    const astroneerResponse = new AstroneerResponse(res);

    // Run the route's middlewares before the handler.
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

    // Run the route's handler.
    await route.handler?.(astroneerRequest, astroneerResponse);
  }
}

/**
 * Returns an Astroneer app.
 */
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
