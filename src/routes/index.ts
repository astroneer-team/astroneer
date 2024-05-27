import { HttpError } from '@astroneer/core';

export default function get() {
  const teste: any = '';
  throw new HttpError(404, 'Not Found');
}
