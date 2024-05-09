import { Logger, normalizeFileNames } from '@astroneer/common';
import path from 'path';
import { ROUTES_FOLDER } from './constants';
import { HttpServerMethods } from './enums/http-server-methods';
import { Request } from './request';
import { Response } from './response';
import { scan } from './scanner';

export type Route = {
  method: string;
  handler?: RouteHandler;
  middlewares?: RouteMiddleware[];
  params?: {
    [key: string]: string;
  };
};

export type RouteHandler = (
  req: Request,
  res: Response,
) => void | Promise<void>;

export type RouteMiddleware = (
  req: Request,
  res: Response,
  next: () => void,
) => void | Promise<void>;

export type AstroneerRouterOptions = {
  devmode: boolean;
  routesDir: string;
};

export type RouteModule = {
  [Method in HttpServerMethods]?: RouteHandler;
} & {
  middlewares?: RouteMiddleware[];
};

export type PreloadedRoute = {
  filePath: string;
  page: string;
  regex: string;
  method: HttpServerMethods;
  params?: {
    [key: string]: string;
  };
  namedRegex: string;
};

export type PreloadedRouteWithHandlers = PreloadedRoute & {
  handler: RouteHandler;
  middlewares: RouteMiddleware[];
};

export type RoutesManifest = {
  dynamicRoutes?: PreloadedRoute[];
  staticRoutes?: PreloadedRoute[];
};

async function importRouteModule(filePath: string): Promise<RouteModule> {
  return await import(filePath);
}

export class AstroneerRouter {
  private readonly logger = new Logger('Router');
  private routes: PreloadedRouteWithHandlers[] = [];

  async preloadRoutes(): Promise<void> {
    const routeFiles: string[] = [];

    await scan({
      rootDir: ROUTES_FOLDER,
      include: [/\.(ts|js)$/],
      onFile(file) {
        routeFiles.push(file);
      },
    });

    await this.loadRoutes(normalizeFileNames(routeFiles));

    this.routes.forEach((route) => {
      this.logger.log(`Mapped ${route.method.toUpperCase()} ${route.page}`);
    });
  }

  private async loadRoutes(fileNames: string[]): Promise<void> {
    const promises = fileNames.map(async (fileName) => {
      const routePath = path.resolve(fileName);
      const routeModule: RouteModule = await importRouteModule(routePath);
      const methodsFn = this.extractMethods(routeModule);
      methodsFn.forEach((method) => {
        const route = this.preloadRoute(routePath, method);
        this.routes.push({
          ...route,
          handler: routeModule[method]!,
          middlewares: routeModule.middlewares || [],
        });
      });
    });

    await Promise.all(promises);
  }

  private extractMethods(routeModule: RouteModule): HttpServerMethods[] {
    return Object.keys(routeModule).filter((key) =>
      Object.values(HttpServerMethods).includes(key as HttpServerMethods),
    ) as HttpServerMethods[];
  }

  private preloadRoute(
    filePath: string,
    method: HttpServerMethods,
  ): PreloadedRoute {
    const safeFilePath = path.normalize(filePath);
    const relativePath = safeFilePath.split(/routes[\\/]/)[1];

    const page = `/${relativePath
      .replace(/\.ts$/, '')
      .replace(/\.js$/, '')
      .replace(/index$/, '')
      .replace(/\/$/, '')
      .replace(/\[([^\]]+)\]/g, ':$1')
      .replaceAll(/\\/g, '/')}`;

    const params: PreloadedRoute['params'] = {};

    const namedRegex = page.replace(/:(\w+)/g, (_, key) => {
      params[key] = key;
      return `:${key}`;
    });

    const regex = new RegExp(
      `^${namedRegex.replace(/\//g, '\\/').replace(/:\w+/g, '([^\\/]+)')}$`,
    );

    return {
      filePath: safeFilePath,
      method,
      namedRegex,
      page,
      regex: regex.source,
      ...(Object.keys(params).length > 0 && { params }),
    };
  }

  async match(method: string, pathname: string): Promise<Route | null> {
    const safePathname = path.normalize(pathname).replaceAll(/\\/g, '/');
    const route = this.findMatchingRoute(this.routes, method, safePathname);

    if (!route) return null;

    const params = this.extractParams(route, safePathname);
    return this.createRoute(method, route, params);
  }

  private findMatchingRoute(
    routesList: PreloadedRouteWithHandlers[],
    method: string,
    pathname: string,
  ): PreloadedRouteWithHandlers | undefined {
    return routesList.find(
      (route) =>
        route.method === method && new RegExp(route.regex).test(pathname),
    );
  }

  private extractParams(
    route: PreloadedRoute,
    pathname: string,
  ): string[] | undefined {
    return pathname.match(new RegExp(route.regex))?.slice(1);
  }

  private async createRoute(
    method: string,
    route: PreloadedRouteWithHandlers,
    params: string[] | undefined,
  ): Promise<Route> {
    return {
      method,
      handler: route.handler,
      middlewares: route.middlewares,
      params: route.params
        ? Object.fromEntries(
            Object.entries(route.params).map((entry, index) => [
              entry[1],
              params?.[index] ?? '',
            ]),
          )
        : {},
    };
  }
}
