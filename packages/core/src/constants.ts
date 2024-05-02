import path from 'path';

export const PROTON_DIST_FOLDER = path.resolve(process.cwd(), '.proton');
export const ROUTES_MANIFEST_FILE = path.resolve(
  PROTON_DIST_FOLDER,
  'routes-manifest.json',
);
export const SOURCE_FOLDER = path.resolve(process.cwd(), 'src');
export const ROUTES_FOLDER = path.resolve(PROTON_DIST_FOLDER, 'routes');
export const SOURCE_ROUTES_FOLDER = path.resolve(SOURCE_FOLDER, 'routes');
export const SERVER_MODULE_PATH = path.resolve(PROTON_DIST_FOLDER, 'server.js');
