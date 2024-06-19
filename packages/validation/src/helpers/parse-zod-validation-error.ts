import { ZodError } from 'zod';

export function parseZodValidationError(error: ZodError) {
  const { errors } = error;
  const obj: Record<string, string> = {};

  for (const err of errors) {
    const key = err.path.join('.');
    obj[key] = err.message;
  }

  return obj;
}
