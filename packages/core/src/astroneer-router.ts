import path from 'path';
import { blue, green } from 'picocolors';
import { AstroneerRequest } from './astroneer-request';
import { AstroneerResponse } from './astroneer-response';
import { compileTsFile } from './compiler';
import {
  ASTRONEER_DIST_FOLDER,
  ROUTES_MANIFEST_FILE,
  SOURCE_FOLDER,
} from './constants';
import { AstroneerErrorCode } from './enums/astroneer-error-code';
import { HttpServerMethods } from './enums/http-server-methods';
import { AstroneerError } from './errors';
import { createFile } from './helpers/create-file';
import { dirExists } from './helpers/dir-exists';
import { scan } from './scanner';

export type Route = {
  /**
   * The HTTP method of the route.
   */
  method: HttpServerMethods;
  /**
   * The handler of the route.
   */
  handler?: RouteHandler;
  /**
   * The middlewares of the route.
   */
  middlewares?: RouteMiddleware[];
  /**
   * The parameters of the route.
   */
  params?: {
    [key: string]: string;
  };
};

export type RouteHandler = (
  /**
   * The request object.
   */
  req: AstroneerRequest,
  /**
   * The response object.
   */
  res: AstroneerResponse,
) => void | Promise<void>;

export type RouteMiddleware = (
  /**
   * The request object.
   */
  req: AstroneerRequest,
  /**
   * The response object.
   */
  res: AstroneerResponse,
  /**
   * The next function to call the next middleware.
   */
  next: () => void,
) => void | Promise<void>;

export type AstroneerRouterOptions = {
  /**
   * Whether the application is in development mode.
   */
  devmode: boolean;
  /**
   * The directory where the routes are located.
   */
  routesDir: string;
};

export type RouteModule = {
  /**
   * The HTTP method of the route.
   */
  [Method in HttpServerMethods]?: RouteHandler;
} & {
  /**
   * The middlewares of the route.
   */
  middlewares?: RouteMiddleware[];
};

export type PreloadedRoute = {
  /**
   * The file path of the route.
   */
  filePath: string;
  /**
   * The page of the route.
   */
  page: string;
  /**
   * The regular expression of the route.
   */
  regex: string;
  /**
   * The HTTP method of the route.
   */
  method: HttpServerMethods;
  /**
   * The parameters of the route.
   */
  params?: {
    [key: string]: string;
  };
  /**
   * The named regular expression of the route.
   */
  namedRegex: string;
};

export type RoutesManifest = {
  /**
   * The dynamic routes of the application.
   */
  dynamicRoutes?: PreloadedRoute[];
  /**
   * The static routes of the application.
   */
  staticRoutes?: PreloadedRoute[];
};

/**
 * Import a route module.
 * @param filePath The file path of the route module.
 * @returns A promise that resolves with the route module.
 */
async function importRouteModule(filePath: string): Promise<RouteModule> {
  return await import(filePath);
}

export class AstroneerRouter {
  /**
   * The options of the router.
   */
  private options: AstroneerRouterOptions;
  /**
   * The preloaded routes of the application.
   */
  private routes: PreloadedRoute[] = [];

  constructor(options: AstroneerRouterOptions) {
    this.options = options;
  }

  /**
   * Scan the routes directory and preload all routes.
   */
  async scan(): Promise<void> {
    const fileMatches: string[] = [];
    const routesDir = path.resolve(
      process.cwd(),
      SOURCE_FOLDER,
      this.options.routesDir,
    );

    if (!dirExists(routesDir)) {
      throw new AstroneerError(
        `Routes directory not found. Please create a new directory named ${green('`routes`')} aside your ${blue('`server.ts`')} file.`,
        AstroneerErrorCode.RoutesDirDoesNotExist,
      );
    }

    await scan({
      rootDir: routesDir,
      include: [/\.ts$/, /\.js$/],
      onFile: fileMatches.push.bind(fileMatches),
    });

    await this.preloadAllRoutes(fileMatches);
  }

  /**
   * Preload all routes.
   * @param routeFiles The route files to preload.
   */
  async preloadAllRoutes(routeFiles: string[]): Promise<void> {
    await Promise.all(
      routeFiles.map(async (fileName) => {
        const routePath = path.resolve(fileName);
        const routeModule: RouteModule = await importRouteModule(routePath);

        // Filter out the methods from the route module.
        const methodsFn = Object.keys(routeModule).filter((key) =>
          Object.values(HttpServerMethods).includes(key as HttpServerMethods),
        ) as HttpServerMethods[];

        await Promise.all(
          methodsFn.map(async (method) => {
            const code = await compileTsFile(fileName);

            createFile({
              filePath: this.getOutputFilePath(fileName),
              content: code,
              overwrite: true,
            });

            this.routes.push(this.preloadRoute(fileName, method));
          }),
        );
      }),
    );

    this.routes.sort((a, b) => a.page.localeCompare(b.page));

    const routesFile = path.resolve(
      ASTRONEER_DIST_FOLDER,
      ROUTES_MANIFEST_FILE,
    );

    /**
     * It creates a routes manifest file that contains the static and dynamic routes of the application.
     * The routes manifest file is used to match the incoming request with the route.
     */
    createFile<RoutesManifest>({
      filePath: routesFile,
      content: {
        dynamicRoutes: this.routes.filter((route) => route.page.includes(':')),
        staticRoutes: this.routes.filter((route) => !route.page.includes(':')),
      },
      overwrite: true,
    });
  }

  /**
   * Preload a route.
   * @param filePath The file path of the route.
   * @param method The HTTP method of the route.
   * @returns The preloaded route.
   */
  preloadRoute(filePath: string, method: HttpServerMethods): PreloadedRoute {
    const relativePath = path.relative(
      path.resolve(process.cwd(), SOURCE_FOLDER, this.options.routesDir),
      filePath,
    );

    /**
     * It is important to note that the page is generated based on the file path.
     * The page is used to match the route with the incoming request.
     */
    const page = `/${relativePath
      .replace(/\.ts$/, '')
      .replace(/\.js$/, '')
      .replace(/index$/, '')
      .replace(/\/$/, '')
      .replace(/\[([^\]]+)\]/g, ':$1')
      .replaceAll(/\\/g, '/')}`;

    const params: PreloadedRoute['params'] = {};

    // Replace the named parameters with a regular expression.
    const namedRegex = page.replace(/:(\w+)/g, (_, key) => {
      params[key] = key;
      return `:${key}`;
    });

    // Create a regular expression from the named regular expression.
    const regex = new RegExp(
      `^${namedRegex.replace(/\//g, '\\/').replace(/:\w+/g, '([^\\/]+)')}$`,
    );

    return {
      filePath,
      page,
      regex: regex.source,
      namedRegex,
      method,
      ...(Object.keys(params).length > 0 ? { params } : {}),
    };
  }

  /**
   * Get the routes manifest of the application.
   * @returns A promise that resolves with the routes manifest.
   */
  async getRoutesManifest(): Promise<RoutesManifest> {
    const routesFile = path.resolve(
      ASTRONEER_DIST_FOLDER,
      ROUTES_MANIFEST_FILE,
    );

    return await import(routesFile);
  }

  /**
   * Match the incoming request with a route.
   * @param method The HTTP method of the request.
   * @param pathname The pathname of the request.
   * @returns A promise that resolves with the matched route.
   */
  async match(method: string, pathname: string): Promise<Route | null> {
    const manifest = await this.getRoutesManifest();
    const routesList = manifest.staticRoutes?.concat(
      manifest.dynamicRoutes || [],
    );

    if (!routesList) return null;

    const route = routesList.find(
      (route) =>
        route.method === method && new RegExp(route.regex).test(pathname),
    );

    if (!route) return null;

    const params = pathname.match(new RegExp(route.regex))?.slice(1);
    const handler = await this.getHandler(route);

    return {
      method: route.method as HttpServerMethods,
      handler,
      middlewares: (await import(route.filePath)).middlewares,
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

  /**
   * Get the handler of a route.
   * @param route The route to get the handler.
   * @returns A promise that resolves with the route handler.
   */
  async getHandler(route: PreloadedRoute): Promise<RouteHandler | undefined> {
    const module = await importRouteModule(route.filePath);
    return module[route.method];
  }

  /**
   * Get the output file path of a route file.
   * @param filePath The file path of the route.
   * @returns The output file path of the route.
   */
  getOutputFilePath(filePath: string): string {
    return path.resolve(
      ASTRONEER_DIST_FOLDER,
      'server',
      'routes',
      path.relative(
        path.resolve(process.cwd(), SOURCE_FOLDER, this.options.routesDir),
        filePath.replace(/\.ts$/, '.js'),
      ),
    );
  }
}
