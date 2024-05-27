import path from 'path';

export const CONFIG_FILE_NAMES = [
  'astroneer.config.js',
  'astroneer.config.json',
];

export const CONFIG_FILE_REGEXS = [
  /\/astroneer\.config\.js$/,
  /\/astroneer\.config\.json$/,
];

export const DIST_FOLDER = path.resolve(process.cwd(), '.astroneer');
export const SOURCE_FOLDER = path.resolve(process.cwd(), 'src');
export const ROUTES_FOLDER = path.resolve(DIST_FOLDER, 'routes');
