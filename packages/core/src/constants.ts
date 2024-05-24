import path from 'path';
import { loadConfig } from './config';

export const DIST_FOLDER = path.resolve('.astroneer');
export const CONFIG = async () => await loadConfig();
export const SOURCE_FOLDER = path.resolve(process.cwd(), 'src');
export const SOURCE_ROUTES_FOLDER = path.resolve(SOURCE_FOLDER, 'routes');
export const CONFIG_FILE = path.resolve(process.cwd(), 'astroneer.config.js');
