import path from 'path';

export function isRouteHandler(filePath: string): boolean {
  return filePath.includes(path.join('src', 'routes'));
}
