import { statSync } from 'fs';
import path from 'path';
import { AstroneerRequest } from './request';
import { AstroneerResponse } from './response';
import { ASTRONEER_DIST_FOLDER, ROUTES_MANIFEST_FILE } from './constants';
import { HttpServerMethods } from './enums/http-server-methods';
import { createFile } from './helpers/create-file';

export type Route = {
  method: string;
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
  methods: HttpServerMethods[];
  params?: {
    [key: string]: string;
  };
  namedRegex: string;
  rawSize: number;
};

export type RoutesManifest = {
  dynamicRoutes?: PreloadedRoute[];
  staticRoutes?: PreloadedRoute[];
};

async function importRouteModule(filePath: string): Promise<RouteModule> {
  return await import(filePath);
}

export class AstroneerRouter {
  private static staticInstanceRef: AstroneerRouter;
  private routes: PreloadedRoute[] = [];

  constructor() {
    if (AstroneerRouter.staticInstanceRef) {
      return AstroneerRouter.staticInstanceRef;
    }

    AstroneerRouter.staticInstanceRef = this;
  }

  async preloadAllRoutes(routeFiles: string[]): Promise<RoutesManifest> {
    const safeRouteFiles = this.normalizeFileNames(routeFiles);
    await this.loadRoutes(safeRouteFiles);

    this.routes.sort((a, b) => a.page.localeCompare(b.page));

    const manifest = this.createRoutesManifest();
    this.saveRoutesManifest(manifest);

    return manifest;
  }

  normalizeFileNames(fileNames: string[]): string[] {
    return fileNames.map((fileName) => path.normalize(fileName));
  }

  async loadRoutes(fileNames: string[]): Promise<void> {
    await Promise.all(
      fileNames.map(async (fileName) => {
        const routePath = path.resolve(fileName);
        delete require.cache[require.resolve(routePath)];
        const routeModule: RouteModule = await importRouteModule(routePath);

        const methodsFn = this.extractMethods(routeModule);

        methodsFn.forEach((method) => {
          const route = this.preloadRoute(routePath, method);

          if (route) {
            this.routes.push(route);
          }
        });
      }),
    );
  }

  extractMethods(routeModule: RouteModule): HttpServerMethods[] {
    return Object.keys(routeModule).filter((key) =>
      Object.values(HttpServerMethods).includes(key as HttpServerMethods),
    ) as HttpServerMethods[];
  }

  createRoutesManifest(): RoutesManifest {
    return {
      dynamicRoutes: this.routes.filter((route) => route.page.includes(':')),
      staticRoutes: this.routes.filter((route) => !route.page.includes(':')),
    };
  }

  saveRoutesManifest(manifest: RoutesManifest): void {
    const routesFile = path.resolve(
      ASTRONEER_DIST_FOLDER,
      ROUTES_MANIFEST_FILE,
    );

    createFile<RoutesManifest>({
      filePath: routesFile,
      content: manifest,
      overwrite: true,
    });
  }

  preloadRoute(
    filePath: string,
    method: HttpServerMethods,
  ): PreloadedRoute | void {
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

    const route = this.routes.find((route) => route.page === page);

    if (!route) {
      return {
        filePath: safeFilePath,
        page,
        regex: regex.source,
        namedRegex,
        methods: [method],
        ...(Object.keys(params).length > 0 && { params }),
        rawSize: statSync(safeFilePath).size,
      };
    }

    route.methods.push(method);
  }

  async getRoutesManifest(): Promise<RoutesManifest> {
    const safeRoutesFile = path.normalize(
      path.join(process.cwd(), ASTRONEER_DIST_FOLDER, ROUTES_MANIFEST_FILE),
    );

    return await import(safeRoutesFile);
  }

  async match(method: string, pathname: string): Promise<Route | null> {
    const safePathname = path.normalize(pathname);
    const manifest = await this.getRoutesManifest();
    const routesList = this.concatRoutes(manifest);

    if (!routesList) return null;

    const route = this.findMatchingRoute(routesList, method, safePathname);

    if (!route) return null;

    const params = this.extractParams(route, safePathname);
    const handler = await this.getHandler(route, method as HttpServerMethods);

    return this.createRoute(method, handler, route, params);
  }

  concatRoutes(manifest: RoutesManifest): PreloadedRoute[] | undefined {
    return manifest.staticRoutes?.concat(manifest.dynamicRoutes || []);
  }

  findMatchingRoute(
    routesList: PreloadedRoute[],
    method: string,
    pathname: string,
  ): PreloadedRoute | undefined {
    return routesList.find(
      (route) =>
        route.methods.includes(method as HttpServerMethods) &&
        new RegExp(route.regex).test(pathname),
    );
  }

  extractParams(route: PreloadedRoute, pathname: string): string[] | undefined {
    return pathname.match(new RegExp(route.regex))?.slice(1);
  }

  async createRoute(
    method: string,
    handler: RouteHandler,
    route: PreloadedRoute,
    params: string[] | undefined,
  ): Promise<Route> {
    return {
      method,
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

  async getHandler(
    route: PreloadedRoute,
    method: HttpServerMethods,
  ): Promise<RouteHandler> {
    return (await import(route.filePath))[method];
  }

  reset(): void {
    this.routes = [];
  }
}
