import path from 'path';
import { blue, green } from 'picocolors';
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
import { AstroneerRequest } from './astroneer-request';
import { AstroneerResponse } from './astroneer-response';

export type Route = {
  method: HttpServerMethods;
  handler?: RouteHandler;
  middlewares?: RouteMiddleware[];
  params?: {
    [key: string]: string;
  };
};

export type RouteHandler = (
  req: AstroneerRequest,
  res: AstroneerResponse,
) => void | Promise<void>;

export type RouteMiddleware = (
  req: AstroneerRequest,
  res: AstroneerResponse,
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

export type RoutesManifest = {
  dynamicRoutes?: PreloadedRoute[];
  staticRoutes?: PreloadedRoute[];
};

async function importRouteModule(filePath: string): Promise<RouteModule> {
  return await import(filePath);
}

export class AstroneerRouter {
  private options: AstroneerRouterOptions;
  private routes: PreloadedRoute[] = [];

  constructor(options: AstroneerRouterOptions) {
    this.options = options;
  }

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

  async preloadAllRoutes(routeFiles: string[]): Promise<void> {
    await Promise.all(
      routeFiles.map(async (fileName) => {
        const routePath = path.resolve(fileName);
        const routeModule: RouteModule = await import(routePath);
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

    createFile<RoutesManifest>({
      filePath: routesFile,
      content: {
        dynamicRoutes: this.routes.filter((route) => route.page.includes(':')),
        staticRoutes: this.routes.filter((route) => !route.page.includes(':')),
      },
      overwrite: true,
    });
  }

  preloadRoute(filePath: string, method: HttpServerMethods): PreloadedRoute {
    const relativePath = path.relative(
      path.resolve(process.cwd(), SOURCE_FOLDER, this.options.routesDir),
      filePath,
    );

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
      filePath,
      page,
      regex: regex.source,
      namedRegex,
      method,
      ...(Object.keys(params).length > 0 ? { params } : {}),
    };
  }

  async getRoutesManifest(): Promise<RoutesManifest> {
    const routesFile = path.resolve(
      ASTRONEER_DIST_FOLDER,
      ROUTES_MANIFEST_FILE,
    );

    return await import(routesFile);
  }

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

  async getHandler(route: PreloadedRoute): Promise<RouteHandler | undefined> {
    const module = await importRouteModule(route.filePath);
    return module[route.method];
  }

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
