import { Logger, createFile, isDevMode, logRequest } from '@astroneer/common';
import { IncomingMessage, ServerResponse } from 'http';
import path from 'path';
import { UrlWithParsedQuery } from 'url';
import { isAsyncFunction } from 'util/types';
import { AstroneerConfig, loadConfig } from './config';
import { DIST_FOLDER } from './constants';
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

    if (isDevMode()) {
      const metadata = router.generateRouteMetadata();
      createFile({
        filePath: path.resolve(DIST_FOLDER, 'routes.json'),
        content: JSON.stringify(metadata, null, 2),
        overwrite: true,
      });
    }

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
      this.logRequestIfNeeded(config, req, res);
      await this.runMiddlewares(route.middlewares ?? [], request, response);
      await this.runHandler(route.handler, request, response);
    } catch (err) {
      this.handleError(err, config, request, response, customHandlers);
    }
  }

  private logRequestIfNeeded(
    config: AstroneerConfig,
    req: IncomingMessage,
    res: ServerResponse,
  ) {
    if (
      config.logRequests &&
      (typeof config.logRequests === 'boolean' ||
        config.logRequests.env?.includes(process.env.NODE_ENV!))
    ) {
      logRequest(req, res);
    }
  }

  private handleError(
    err: Error,
    config: AstroneerConfig,
    request: Request,
    response: Response,
    customHandlers?: {
      onError?: ErrorRouteHandler;
      onNotFound?: RouteHandler;
    },
  ) {
    if (err.name === UnprocessableError.name) {
      Logger.error(err.message);
      process.exit(1);
    }

    this.logErrorIfNeeded(err, config);

    if (customHandlers?.onError) {
      return customHandlers.onError(err, request, response);
    }

    if (err instanceof HttpError) {
      return err.build(response);
    }
  }

  private logErrorIfNeeded(err: Error, config: AstroneerConfig) {
    if (config.logErrors) {
      const logger =
        typeof config.logErrors === 'object' && config.logErrors?.asDebug
          ? Logger.debug
          : Logger.error;

      if (
        typeof config.logErrors === 'boolean' ||
        config.logErrors.env?.includes(process.env.NODE_ENV!)
      ) {
        logger(err.stack);
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

  private async runInQueue(
    middlewares: RouteMiddleware[],
    req: Request,
    res: Response,
  ): Promise<void> {
    const queue = [...middlewares];

    const next = async () => {
      if (queue.length) {
        const middleware = queue.shift();

        if (!isAsyncFunction(middleware)) {
          throw new UnprocessableError(
            'Astroneer middlewares must be async functions. Please refer to https://astroneer.dev/docs/middlewares for more information.',
          );
        }

        try {
          await middleware?.(req, res, next);
        } catch (err) {
          throw err;
        }
      }
    };

    return new Promise<void>((resolve, reject) => {
      next().then(resolve).catch(reject);
    });
  }

  private async runHandler(handler: RouteHandler, req: Request, res: Response) {
    await handler(req, res);
  }
}
