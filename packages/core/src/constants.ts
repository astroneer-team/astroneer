import path from 'path';

export const DIST_FOLDER = path.resolve(process.cwd(), '.astroneer');
export const ROUTES_MANIFEST_FILE = path.resolve(
  DIST_FOLDER,
  'routes-manifest.json',
);
export const SOURCE_FOLDER = path.resolve(process.cwd(), 'src');
export const ROUTES_FOLDER = path.resolve(DIST_FOLDER, 'routes');
export const SOURCE_ROUTES_FOLDER = path.resolve(SOURCE_FOLDER, 'routes');
export const SERVER_MODULE_PATH = path.resolve(DIST_FOLDER, 'server.js');
