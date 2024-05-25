import { Logger, logRequest } from '@astroneer/common';
import { IncomingMessage, ServerResponse } from 'http';
import { UrlWithParsedQuery } from 'url';
import { isAsyncFunction } from 'util/types';
import { loadConfig } from './config';
import { HttpServerMethods } from './enums/http-server-methods';
import { HttpError } from './errors';
import { UnprocessableError } from './errors/application/unprocessable-error';
import { Request } from './request';
import { Response } from './response';
import {
  AstroneerRouter,
  Route,
  RouteHandler,
  RouteMiddleware,
} from './router';

export type ErrorRouteHandler = (
  err: Error,
  req: Request,
  res: Response,
) => void | Promise<void>;

/**
 * The `Astroneer` class represents the core functionality of the Astroneer framework.
 * It provides methods for preparing the framework, handling incoming HTTP requests,
 * and running middlewares and handlers.
 *
 * @since 0.1.0
 */
export class Astroneer {
  private constructor(private router: AstroneerRouter) {}

  /**
   * The `prepare` method is a factory method that creates a new instance of
   * {@link Astroneer} and preloads all routes from the router.
   *
   * @example
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
   *
   * @returns A promise that resolves to an instance of {@link Astroneer}.
   */
  static async prepare(): Promise<Astroneer> {
    const router = new AstroneerRouter();
    await router.preloadRoutes();
    return new Astroneer(router);
  }

  /**
   * The `handle` method is the main entry point for handling incoming HTTP requests.
   * It matches the request to a route, runs any middlewares, and executes the handler.
   *
   * @param req - The incoming HTTP request.
   * @param res - The server response object.
   * @param parsedUrl - The parsed URL object.
   */
  async handle(
    req: IncomingMessage,
    res: ServerResponse,
    parsedUrl: UrlWithParsedQuery,
    customHandlers?: {
      onError?: ErrorRouteHandler;
      onNotFound?: RouteHandler;
    },
  ): Promise<void> {
    const config = await loadConfig();
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
      await this.runMiddlewares(route.middlewares ?? [], request, response);
      await this.runHandler(route.handler, request, response);

      if (config.logRequests) {
        if (typeof config.logRequests === 'boolean') {
          logRequest(req, res);
        } else if (typeof config.logRequests === 'object') {
          if (config.logRequests.env) {
            if (config.logRequests.env.includes(process.env.NODE_ENV!)) {
              logRequest(req, res);
            }
          }
        }
      }
    } catch (err) {
      if (err.name === UnprocessableError.name) {
        Logger.error(err.message);
        process.exit(1);
      }

      if (config.logErrors) {
        if (typeof config.logErrors === 'boolean') {
          Logger.error(err.stack);
        } else if (typeof config.logErrors === 'object') {
          const logger = config.logErrors?.asDebug
            ? Logger.debug
            : Logger.error;

          if (config.logErrors.env) {
            if (config.logErrors.env.includes(process.env.NODE_ENV!)) {
              logger(err.stack);
            }
          } else {
            logger(err.stack);
          }
        }
      }

      if (customHandlers?.onError) {
        return customHandlers.onError(err, request, response);
      }

      if (err.name === HttpError.name) {
        return err.build(response);
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

  private async runMiddlewares(
    middlewares: RouteMiddleware[],
    req: Request,
    res: Response,
  ) {
    if (middlewares.length) {
      await this.runInQueue(middlewares, req, res);
    }
  }

  private runInQueue(
    middlewares: RouteMiddleware[],
    req: Request,
    res: Response,
  ) {
    return new Promise<void>((resolve, reject) => {
      const queue = middlewares.slice();
      const next = () => {
        if (queue.length) {
          const middleware = queue.shift();
          try {
            if (!middleware) return;
            if (!isAsyncFunction(middleware)) {
              throw new UnprocessableError(
                'Astroneer middlewares must be async functions. Please refer to https://astroneer.dev/docs/middlewares for more information.',
              );
            }
            middleware(req, res, next).catch(reject);
          } catch (err) {
            reject(err);
          }
        } else {
          resolve();
        }
      };

      next();
    });
  }

  private async runHandler(handler: RouteHandler, req: Request, res: Response) {
    await handler(req, res);
  }
}
