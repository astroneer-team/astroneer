import { HttpError } from '@astroneer/core';

export function get() {
  throw new HttpError(404, 'Not Found');
}
