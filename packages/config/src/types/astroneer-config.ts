import { CompilerOptions } from './compilers-options';

export type AstroneerConfig = {
  compiler?: CompilerOptions;
  logger?: {
    httpErrors?: boolean;
  };
};
