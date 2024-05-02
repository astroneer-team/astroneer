import { IncomingMessage, ServerResponse } from 'http';
import { UrlWithParsedQuery } from 'url';
import { AstroneerRequest } from './request';
import { AstroneerResponse } from './response';
import { AstroneerRouter, Route, RouteMiddleware } from './router';

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
  private router: AstroneerRouter = new AstroneerRouter();

  async handle(
    req: IncomingMessage,
    res: ServerResponse,
    parsedUrl: UrlWithParsedQuery,
  ) {
    const route = await this.matchRoute(req, parsedUrl);

    if (!route?.handler) {
      this.sendNotFound(res);
      return;
    }

    const { astroneerRequest, astroneerResponse } =
      this.prepareRequestAndResponse(req, res, route, parsedUrl);

    await this.runMiddlewares(route, astroneerRequest, astroneerResponse);
    await this.runHandler(route, astroneerRequest, astroneerResponse);
  }

  private async matchRoute(
    req: IncomingMessage,
    parsedUrl: UrlWithParsedQuery,
  ) {
    return await this.router.match(req.method as any, parsedUrl.pathname!);
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
    const astroneerRequest = new AstroneerRequest(req, route.params, query);
    const astroneerResponse = new AstroneerResponse(res);

    return { astroneerRequest, astroneerResponse };
  }

  private async runMiddlewares(
    route: Route,
    astroneerRequest: AstroneerRequest,
    astroneerResponse: AstroneerResponse,
  ) {
    if (route.middlewares?.length) {
      try {
        await Promise.all(
          route.middlewares.map((middleware) =>
            this.runMiddleware(middleware, astroneerRequest, astroneerResponse),
          ),
        );
      } catch (error) {
        console.error('Error running middlewares', error);
        throw error;
      }
    }
  }

  private runMiddleware(
    middleware: RouteMiddleware,
    astroneerRequest: AstroneerRequest,
    astroneerResponse: AstroneerResponse,
  ) {
    return new Promise<void>((resolve, reject) => {
      try {
        middleware(astroneerRequest, astroneerResponse, resolve);
      } catch (error) {
        reject(error);
      }
    });
  }

  private async runHandler(
    route: Route,
    astroneerRequest: AstroneerRequest,
    astroneerResponse: AstroneerResponse,
  ) {
    try {
      await route.handler?.(astroneerRequest, astroneerResponse);
    } catch (error) {
      console.error('Error running handler', error);
      throw error;
    }
  }
}
