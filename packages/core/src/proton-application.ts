import { IncomingMessage, ServerResponse } from 'http';
import { UrlWithParsedQuery } from 'url';
import { ProtonRequest } from './request';
import { ProtonResponse } from './response';
import { ProtonRouter, Route, RouteMiddleware } from './router';

/**
 * The Proton.js application that processes incoming requests.
 */
export class ProtonApplication {
  private router: ProtonRouter = new ProtonRouter();

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
    const request = new ProtonRequest(req, route.params, query);
    const response = new ProtonResponse(res);

    return { request, response };
  }

  private async runMiddlewares(
    route: Route,
    ProtonRequest: ProtonRequest,
    ProtonResponse: ProtonResponse,
  ) {
    if (route.middlewares?.length) {
      try {
        await Promise.all(
          route.middlewares.map((middleware) =>
            this.runMiddleware(middleware, ProtonRequest, ProtonResponse),
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
    ProtonRequest: ProtonRequest,
    ProtonResponse: ProtonResponse,
  ) {
    return new Promise<void>((resolve, reject) => {
      try {
        middleware(ProtonRequest, ProtonResponse, resolve);
      } catch (error) {
        reject(error);
      }
    });
  }

  private async runHandler(
    route: Route,
    ProtonRequest: ProtonRequest,
    ProtonResponse: ProtonResponse,
  ) {
    try {
      await route.handler?.(ProtonRequest, ProtonResponse);
    } catch (error) {
      console.error('Error running handler', error);
      throw error;
    }
  }
}
