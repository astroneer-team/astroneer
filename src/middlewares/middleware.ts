import { HttpError, RouteMiddleware } from '@astroneer/core';

export const middleware: RouteMiddleware = async () => {
  throw new HttpError(401, 'Not Found');
};
