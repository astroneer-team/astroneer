import { IncomingMessage, ServerResponse } from 'http';
import { UrlWithParsedQuery } from 'url';
import { Request } from './request';
import { Response } from './response';
import { AstroneerRouter, Route, RouteMiddleware } from './router';

/**
 * The Astroneer.js application that processes incoming requests.
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

    const { request, response } = this.prepareRequestAndResponse(
      req,
      res,
      route,
      parsedUrl,
    );

    await this.runMiddlewares(route, request, response);
    await this.runHandler(route, request, response);
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
    const request = new Request(req, route.params, query);
    const response = new Response(res);

    return { request, response };
  }

  private async runMiddlewares(
    route: Route,
    Request: Request,
    Response: Response,
  ) {
    if (route.middlewares?.length) {
      try {
        await Promise.all(
          route.middlewares.map((middleware) =>
            this.runMiddleware(middleware, Request, Response),
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
    Request: Request,
    Response: Response,
  ) {
    return new Promise<void>((resolve, reject) => {
      try {
        middleware(Request, Response, resolve);
      } catch (error) {
        reject(error);
      }
    });
  }

  private async runHandler(route: Route, Request: Request, Response: Response) {
    try {
      await route.handler?.(Request, Response);
    } catch (error) {
      console.error('Error running handler', error);
      throw error;
    }
  }
}
