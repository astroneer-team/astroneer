import * as swc from '@swc/core';
import path from 'path';
import { blue, green } from 'picocolors';
import { ASTRONEER_DIST_FOLDER, ROUTES_MANIFEST_FILE } from './constants';
import { AstroneerErrorCode } from './enums/astroneer-error-code';
import { HttpServerMethods } from './enums/http-server-methods';
import { AstroneerError } from './errors';
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

  constructor(options: AstroneerRouterOptions) {
    this.options = options;
  }

  async scan(): Promise<void> {
    const fileMatches: string[] = [];
    const routesDir = path.resolve(
      process.cwd(),
      'example',
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
    const routes: PreloadedRoute[] = [];

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
              const { code } = await swc.transformFile(fileName, {
                jsc: {
                  parser: {
                    syntax: 'typescript',
                  },
                  target: 'esnext',
                },
                module: {
                  type: 'commonjs',
                },
              });

              createFile({
                filePath: path.resolve(
                  ASTRONEER_DIST_FOLDER,
                  'server',
                  'routes',
                  path.relative(
                    path.resolve(
                      process.cwd(),
                      'example',
                      this.options.routesDir,
                    ),
                    fileName.replace(/\.ts$/, '.js'),
                  ),
                ),
                content: code,
                overwrite: true,
              });
            }

            routes.push(this.preloadRoute(fileName, method));
          }),
        );
      }),
    );

    routes.sort((a, b) => a.page.localeCompare(b.page));

    const routesFile = path.resolve(
      ASTRONEER_DIST_FOLDER,
      ROUTES_MANIFEST_FILE,
    );

    createFile<RoutesManifest>({
      filePath: routesFile,
      content: {
        dynamicRoutes: routes.filter((route) => route.page.includes(':')),
        staticRoutes: routes.filter((route) => !route.page.includes(':')),
      },
      overwrite: true,
    });
  }

  preloadRoute(filePath: string, method: string): PreloadedRoute {
    const relativePath = path.relative(
      path.resolve(process.cwd(), 'example', this.options.routesDir),
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

    for (const route of routesList) {
      if (route.method === method && new RegExp(route.regex).test(pathname)) {
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
    }

    return null;
  }
}
