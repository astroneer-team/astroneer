import { HttpError } from '@astroneer/common';
import { ZodSchema } from 'zod';
import { parseZodValidationError } from './helpers/parse-zod-validation-error';
import { loadConfig } from '@astroneer/config';
import { RouteHandler } from '@astroneer/core';

export function withBodyValidation(
  schema: ZodSchema,
  handler: RouteHandler,
): RouteHandler {
  return async (req, res) => {
    const config = loadConfig();
    const body = await req.body();

    if (!body) {
      throw new HttpError(400, 'Request body is required');
    }

    const validated = schema.safeParse(body);

    if (!validated.success) {
      throw new HttpError(
        400,
        config.validation?.request?.body?.defaultErrorMessage ??
          'Failed to validate request body',
        parseZodValidationError(validated.error),
      );
    }

    req.body = () => new Promise((resolve) => resolve(validated.data));
    return handler(req, res);
  };
}
