import { IncomingMessage, ServerResponse } from 'http';
import picocolors from 'picocolors';
import { Logger } from './logger';

export function logRequest(
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage>,
) {
  const logger = new Logger();
  const start = Date.now();

  req.on('end', () => {
    const timestamp = picocolors.blue(`(${Date.now() - start}ms)`);
    const method = picocolors.gray(req.method ?? '');
    const url = picocolors.cyan(req.url ?? '');
    const status = res.statusCode;
    const statusColor = status >= 400 ? 'red' : 'green';

    logger.debug(
      `${picocolors[statusColor](status)} ${url} ${method} ${timestamp}`,
    );
  });
}
