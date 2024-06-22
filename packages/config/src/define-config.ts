import { AstroneerConfig } from './types';

export function defineConfig(config?: AstroneerConfig): AstroneerConfig {
  return {
    compiler: {
      type: config?.compiler?.type ?? 'swc',
      typeCheck: config?.compiler?.typeCheck ?? true,
    },
    logger: {
      httpErrors: config?.logger?.httpErrors ?? true,
    },
    validation: {
      request: {
        body: {
          defaultErrorMessage:
            config?.validation?.request?.body?.defaultErrorMessage ?? '',
        },
      },
    },
  };
}
