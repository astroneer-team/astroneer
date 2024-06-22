import { ServerResponse } from 'http';

export function enableCors(
  res: ServerResponse,
  corsOptions: {
    origin?: string;
    methods?: string;
    allowedHeaders?: string;
    credentials?: boolean;
    maxAge?: string;
  },
) {
  res.setHeader('Access-Control-Allow-Origin', corsOptions.origin || '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    corsOptions.methods || 'GET, POST, PUT, DELETE',
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    corsOptions.allowedHeaders || 'Content-Type, Authorization',
  );
  res.setHeader(
    'Access-Control-Allow-Credentials',
    corsOptions.credentials ? 'true' : 'false',
  );
  res.setHeader('Access-Control-Max-Age', corsOptions.maxAge || '86400');
}
