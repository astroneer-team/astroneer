import { Logger } from '@astroneer/common';
import { resolve } from 'path';

type CompilerType = 'esbuild' | 'swc';
type CompilerOptions = {
  type: CompilerType;
  bundle:
    | boolean
    | {
        externalModules: string[];
      };
};

export interface AstroneerConfig {
  compiler: CompilerOptions;
  logErrors?:
    | boolean
    | {
        env?: ('development' | 'production' | string)[];
        asDebug?: boolean;
      };
  logRequests?:
    | boolean
    | {
        env?: ('development' | 'production' | string)[];
      };
}

export function defineConfig(config: Partial<AstroneerConfig>) {
  const _compiler = {
    type: config.compiler?.type ?? 'esbuild',
    bundle: config.compiler?.bundle ?? true,
  };

  if (_compiler.type === 'swc' && _compiler.bundle) {
    Logger.error(
      'SWC does not support bundling for node platform applications. Please disable bundling by setting `bundle` to `false` in the compiler configuration.',
    );

    process.exit(1);
  }

  return {
    ...config,
    outDir: resolve('.astroneer'),
    compiler: _compiler,
  };
}

export async function loadConfig(): Promise<AstroneerConfig> {
  try {
    const config = await import(
      resolve(
        process.env.ASTRONEER_CONTEXT === 'start'
          ? resolve(process.cwd(), '.astroneer', 'astroneer.config.json')
          : resolve(process.cwd(), 'astroneer.config.js'),
      )
    ).then((m) => m.default);
    return config;
  } catch (err) {
    Logger.error(
      'Unable to load config file. Please read https://astroneer.dev/docs/overview#astroneer-config to see more details.',
    );

    console.error(err);
    process.exit(1);
  }
}
