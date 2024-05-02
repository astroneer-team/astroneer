import { IncomingMessage, ServerResponse } from 'http';
import picocolors from 'picocolors';
import { colorRouteMethod } from './color-route-method';

export function logRequest(
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage>,
) {
  const start = Date.now();

  req.on('end', () => {
    const timestamp = picocolors.blue(`(${Date.now() - start}ms)`);
    const method = colorRouteMethod(req.method ?? '');
    const url = picocolors.cyan(req.url ?? '');
    const status = res.statusCode;
    const statusColor = status >= 400 ? 'red' : 'green';

    console.log(
      `${picocolors.gray(new Date().toISOString())} ${picocolors[statusColor](status)} ${url} ${method} ${timestamp}`,
    );
  });
}
