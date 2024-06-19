import { HttpError } from '@astroneer/common';
import { RouteHandler } from '@astroneer/core';
import { ZodSchema } from 'zod';
import { parseZodValidationError } from './helpers/parse-zod-validation-error';

export function withBodyValidation(
  schema: ZodSchema,
  handler: RouteHandler,
): RouteHandler {
  return async (req, res) => {
    const body = await req.body();

    if (!body) {
      throw new HttpError(400, 'Request body is required');
    }

    const validated = schema.safeParse(body);

    if (!validated.success) {
      throw new HttpError(
        400,
        'Failed to validate request body',
        parseZodValidationError(validated.error),
      );
    }

    req.body = () => new Promise((resolve) => resolve(validated.data));
    return await handler(req, res);
  };
}
