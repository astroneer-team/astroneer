import { IncomingMessage, ServerResponse } from 'http';
import { UrlWithParsedQuery } from 'url';
import { AstroneerRequest } from './astroneer-request';
import { AstroneerResponse } from './astroneer-response';
import { AstroneerRouter } from './astroneer-router';

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

    const query = Object.fromEntries(
      new URLSearchParams(parsedUrl.search ?? '').entries(),
    );

    const astroneerRequest = new AstroneerRequest(req, route.params, query);
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
  const app = new Astroneer({
    devmode,
    hostname,
    port,
    router: new AstroneerRouter(),
  });

  return app;
}
