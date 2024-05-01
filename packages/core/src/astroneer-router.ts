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
import { NotFoundError } from './errors/http/not-found-error';
import { createFile } from './helper/create-file';
import { dirExists } from './helper/dir-exists';
import { scan } from './scanner';

export type Route = {
  method: HttpServerMethods;
  handler: RouteHandler;
  middlewares?: RouteMiddleware[];
  params?: {
    [key: string]: string;
  };
};

export type RouteHandler = (req: any, res: any) => void | Promise<void>;
export type RouteMiddleware = (
  req: any,
  res: any,
  next: () => void,
) => void | Promise<void>;

export type AstroneerRouterOptions = {
  devmode: boolean;
  routesDir: string;
};

export type RouterModule = {
  [Method in HttpServerMethods]?: RouteHandler;
} & {
  middlewares?: RouteMiddleware[];
};

export type PreloadedRoute = {
  filePath: string;
  page: string;
  regex: string;
  method: string;
  params?: {
    [key: string]: string;
  };
  namedRegex: string;
};

export type RoutesManifest = {
  dynamicRoutes?: PreloadedRoute[];
  staticRoutes?: PreloadedRoute[];
};

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
        const routeModule: RouterModule = await import(routePath);
        const methodsFn = Object.keys(routeModule).filter((key) =>
          Object.values(HttpServerMethods).includes(key as HttpServerMethods),
        );

        await Promise.all(
          methodsFn.map(async (method) => {
            if (!this.options.devmode) {
              const code = await compileTsFile(fileName);

              createFile({
                filePath: this.getOutputFilePath(fileName),
                content: code,
                overwrite: true,
              });
            }

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

  preloadRoute(filePath: string, method: string): PreloadedRoute {
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

  async match(method: string, pathname: string): Promise<Route | null> {
    const routesFile = path.resolve(
      ASTRONEER_DIST_FOLDER,
      ROUTES_MANIFEST_FILE,
    );

    const routes: RoutesManifest = await import(routesFile);

    const routesList = routes.staticRoutes?.concat(routes.dynamicRoutes || []);

    if (!routesList) {
      return null;
    }

    const route = routesList.find(
      (route) =>
        route.method === method && new RegExp(route.regex).test(pathname),
    );

    if (!route) {
      throw new NotFoundError(`Route not found for ${method} ${pathname}`);
    }

    const params = pathname.match(new RegExp(route.regex))?.slice(1);

    return {
      method: route.method as HttpServerMethods,
      handler: (await import(route.filePath))[route.method],
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
