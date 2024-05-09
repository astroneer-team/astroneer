import { IncomingMessage, ServerResponse } from 'http';
import { UrlWithParsedQuery } from 'url';
import { HttpServerMethods } from './enums/http-server-methods';
import { HttpError } from './errors';
import { Request } from './request';
import { Response } from './response';
import { AstroneerRouter, Route, RouteMiddleware } from './router';

export class Astroneer {
  private constructor(private router: AstroneerRouter) {}

  /**
   * The `prepare` method is a factory method that creates a new instance of
   * {@link Astroneer} and preloads all routes from the router.
   *
   * ```ts
   * import { Astroneer } from '@astroneer/core';
   * import { createServer } from 'http';
   *
   * export default async function server() {
   *  const app = await Astroneer.prepare();
   *  return createServer(async (req, res) => {
   *   try {
   *     const parsedUrl = parse(req.url || '', true);
   *     await app.handle(req, res, parsedUrl);
   *   } catch (err) {
   *     console.error(err);
   *     res.writeHead(500, { 'Content-Type': 'text/plain' });
   *   }
   *  })
   * }
   * ```
   * @since 0.1.0
   */
  static async prepare(): Promise<Astroneer> {
    const router = new AstroneerRouter();
    await router.preloadRoutes();
    return new Astroneer(router);
  }

  /**
   * The `handle` method is the main entry point for handling incoming HTTP requests.
   * It matches the request to a route, runs any middlewares, and executes the handler.
   */
  async handle(
    req: IncomingMessage,
    res: ServerResponse,
    parsedUrl: UrlWithParsedQuery,
  ): Promise<void> {
    const route = await this.matchRoute(req, parsedUrl);

    if (!route?.handler) {
      return this.sendNotFound(res);
    }

    const { request, response } = this.prepareRequestAndResponse(
      req,
      res,
      route,
      parsedUrl,
    );

    try {
      await this.runMiddlewares(route, request, response);
      await this.runHandler(route, request, response);
    } catch (err) {
      if (err instanceof HttpError) {
        response.status(err.statusCode).json(err.toJSON());
      }
    }
  }

  private async matchRoute(
    req: IncomingMessage,
    parsedUrl: UrlWithParsedQuery,
  ) {
    return this.router.match(
      req.method as HttpServerMethods,
      parsedUrl.pathname!,
    );
  }

  private sendNotFound(res: ServerResponse) {
    res.statusCode = 404;
    res.end('Not Found');
  }

  private prepareRequestAndResponse(
    req: IncomingMessage,
    res: ServerResponse,
    route: Route,
    parsedUrl: UrlWithParsedQuery,
  ) {
    const query = Object.fromEntries(
      new URLSearchParams(parsedUrl.search ?? '').entries(),
    );
    const request = new Request(req, route.params, query);
    const response = new Response(res);

    return { request, response };
  }

  private async runMiddlewares(route: Route, req: Request, res: Response) {
    if (route.middlewares?.length) {
      try {
        await Promise.all(
          route.middlewares.map((middleware) =>
            this.runMiddleware(middleware, req, res),
          ),
        );
      } catch (err) {
        throw err;
      }
    }
  }

  private runMiddleware(
    middleware: RouteMiddleware,
    Request: Request,
    Response: Response,
  ) {
    return new Promise<void>((resolve, reject) => {
      try {
        middleware(Request, Response, resolve);
      } catch (err) {
        reject(err);
      }
    });
  }

  private async runHandler(route: Route, Request: Request, Response: Response) {
    try {
      await route.handler?.(Request, Response);
    } catch (err) {
      console.error('Error running handler', err);
      throw err;
    }
  }
}
