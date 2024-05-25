import { Logger, normalizeFileNames } from '@astroneer/common';
import path, { resolve } from 'path';
import { DIST_FOLDER } from './constants';
import { HttpServerMethods } from './enums/http-server-methods';
import { Request } from './request';
import { Response } from './response';
import { scan } from './scanner';

export type Route = {
  /**
   * The HTTP method for the route.
   */
  method: string;
  /**
   * The handler function for the route.
   */
  handler?: RouteHandler;
  /**
   * An array of middlewares to run before the handler.
   */
  middlewares?: RouteMiddleware[];
  /**
   * An object containing the route's parameters.
   */
  params?: {
    [key: string]: string;
  };
};

export type RouteHandler = (
  /**
   * The incoming request object.
   */
  req: Request,
  /**
   * The outgoing response object.
   */
  res: Response,
) => void | Promise<void>;

export type RouteMiddleware = (
  /**
   * The incoming request object.
   */
  req: Request,
  /**
   * The outgoing response object.
   */
  res: Response,
  /**
   * The next middleware in the chain.
   */
  next: () => void,
) => Promise<void>;

export type AstroneerRouterOptions = {
  /**
   * A boolean flag indicating whether the application is running in development mode.
   */
  devmode: boolean;
  /**
   * The directory where the routes are located.
   */
  routesDir: string;
};

export type RouteModule = {
  [Method in HttpServerMethods]?: RouteHandler;
} & {
  middlewares?: RouteMiddleware[];
};

export type PreloadedRoute = {
  /**
   * The path to the route file.
   */
  filePath: string;
  /**
   * The HTTP method for the route.
   */
  page: string;
  /**
   * The regular expression for the route.
   */
  regex: string;
  /**
   * The named regular expression for the route.
   */
  method: HttpServerMethods;
  /**
   * An object containing the route's parameters.
   */
  params?: {
    [key: string]: string;
  };
  /**
   * The named regular expression for the route.
   */
  namedRegex: string;

  middlewares?: RouteMiddleware[];
};

export type PreloadedRouteWithHandlers = PreloadedRoute & {
  /**
   * The handler function for the route.
   */
  handler: RouteHandler;
  /**
   * An array of middlewares to run before the handler.
   */
  middlewares: RouteMiddleware[];
};

async function importRouteModule(filePath: string): Promise<RouteModule> {
  return await import(filePath);
}

/**
 * Represents the AstroneerRouter class.
 */
export class AstroneerRouter {
  private readonly logger = new Logger();

  /**
   * An array of preloaded routes.
   */
  private routes: PreloadedRouteWithHandlers[] = [];

  generateRouteMetadata(): string {
    const staticRoutes: PreloadedRoute[] = [];
    const dynamicRoutes: PreloadedRoute[] = [];

    [...this.routes].forEach((route) => {
      const _route: PreloadedRoute = {
        filePath: route.filePath,
        page: route.page,
        regex: route.regex,
        method: route.method,
        namedRegex: route.namedRegex,
        params: route.params,
      };

      if (_route.namedRegex.includes(':')) {
        dynamicRoutes.push(_route);
      } else {
        staticRoutes.push(_route);
      }
    });

    const metadata = {
      staticRoutes,
      dynamicRoutes,
    };

    return JSON.stringify(metadata, null, 2);
  }

  /**
   * The `preloadRoutes` method scans the routes directory and preloads all routes.
   * @since 0.1.0
   */
  async preloadRoutes(): Promise<PreloadedRoute[]> {
    const routeFiles: string[] = [];

    // Scan the routes directory for route files
    await scan({
      rootDir: resolve(DIST_FOLDER, 'routes'),
      include: [/\/*.(t|j)s$/],
      exclude: [/\/*.d\.ts$/, /\/*.spec\.(t|j)s$/],
      onFile(file) {
        delete require.cache[file];
        routeFiles.push(file);
      },
    });

    // Load the routes
    await this.loadRoutes(normalizeFileNames(routeFiles));

    // Log the mapped routes
    this.routes.forEach((route) => {
      this.logger.log(`Mapped ${route.method.toUpperCase()} ${route.page}`);
    });

    return this.routes;
  }

  /**
   * Loads the routes from the given file names.
   * @param fileNames - The array of file names to load routes from.
   * @returns A promise that resolves when all routes are loaded.
   * @private
   */
  private async loadRoutes(fileNames: string[]): Promise<void> {
    const promises = fileNames.map(async (fileName) => {
      const routePath = path.resolve(fileName);
      // Import the route module
      const routeModule: RouteModule = await importRouteModule(routePath);
      const methodsFn = this.extractMethods(routeModule);
      methodsFn.forEach((method) => {
        // Preload the route
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

  /**
   * Extracts the HTTP server methods from the given route module.
   * @param routeModule - The route module to extract methods from.
   * @returns An array of HTTP server methods.
   * @private
   */
  private extractMethods(routeModule: RouteModule): HttpServerMethods[] {
    return Object.keys(routeModule).filter((key) =>
      Object.values(HttpServerMethods).includes(key as HttpServerMethods),
    ) as HttpServerMethods[];
  }

  /**
   * Preloads a route based on the file path and HTTP server method.
   * @param filePath - The file path of the route.
   * @param method - The HTTP server method.
   * @returns The preloaded route.
   * @private
   */
  private preloadRoute(
    filePath: string,
    method: HttpServerMethods,
  ): PreloadedRoute {
    const safeFilePath = path.normalize(filePath);
    const relativePath = safeFilePath.split(/routes[\\/]/)[1];

    // Normalize the route path
    const page = `/${relativePath
      .replace(/\.ts$/, '')
      .replace(/\.js$/, '')
      .replace(/index$/, '')
      .replace(/\/$/, '')
      .replace(/\[([^\]]+)\]/g, ':$1')
      .replaceAll(/\\/g, '/')
      .replace(/\/$/, '')}`;

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

  /**
   * Matches the given HTTP server method and pathname to a route.
   * @param method - The HTTP server method.
   * @param pathname - The pathname to match.
   * @returns A promise that resolves to the matched route, or null if no match is found.
   */
  async match(method: string, pathname: string): Promise<Route | null> {
    const safePathname = path.normalize(pathname).replaceAll(/\\/g, '/');
    const route = this.findMatchingRoute(this.routes, method, safePathname);

    if (!route) return null;

    const params = this.extractParams(route, safePathname);
    return this.createRoute(method, route, params);
  }

  /**
   * Finds a matching route from the given routes list based on the HTTP server method and pathname.
   * @param routesList - The list of routes to search.
   * @param method - The HTTP server method.
   * @param pathname - The pathname to match.
   * @returns The matching route, or undefined if no match is found.
   * @private
   */
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

  /**
   * Extracts the route parameters from the given route and pathname.
   * @param route - The route to extract parameters from.
   * @param pathname - The pathname to extract parameters from.
   * @returns An array of route parameters, or undefined if no parameters are found.
   * @private
   */
  private extractParams(
    route: PreloadedRoute,
    pathname: string,
  ): string[] | undefined {
    return pathname.match(new RegExp(route.regex))?.slice(1);
  }

  /**
   * Creates a Route object based on the given method, route, and parameters.
   * @param method - The HTTP server method.
   * @param route - The preloaded route.
   * @param params - The route parameters.
   * @returns A promise that resolves to the created Route object.
   * @private
   */
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
