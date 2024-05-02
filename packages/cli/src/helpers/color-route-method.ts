import picocolors from 'picocolors';

export function colorRouteMethod(method: string): string {
  switch (method) {
    case 'GET':
      return picocolors.green(method);
    case 'POST':
      return picocolors.yellow(method);
    case 'PUT':
      return picocolors.blue(method);
    case 'DELETE':
      return picocolors.red(method);
    default:
      return picocolors.gray(method);
  }
}
