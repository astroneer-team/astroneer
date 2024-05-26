import { AstroneerConfig } from './types';

export function defineConfig(config?: AstroneerConfig): AstroneerConfig {
  return {
    compiler: {
      type: 'swc',
      ...config?.compiler,
    },
    logger: {
      httpErrors: true,
      ...config?.logger,
    },
  };
}
