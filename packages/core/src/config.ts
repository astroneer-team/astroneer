import { Logger } from '@astroneer/common';
import { resolve } from 'path';
import { CONFIG_FILE } from './constants';

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
  outDir: string;
  compiler: CompilerOptions;
}

export function defineConfig({ outDir, compiler }: Partial<AstroneerConfig>) {
  const _outDir = outDir ?? '.astroneer';
  const _compiler = {
    type: compiler?.type ?? 'esbuild',
    bundle: compiler?.bundle ?? true,
  };

  if (_compiler.type === 'swc' && _compiler.bundle) {
    Logger.error(
      'SWC does not support bundling for node platform applications. Please disable bundling by setting `bundle` to `false` in the compiler configuration.',
    );

    process.exit(1);
  }

  return {
    outDir: resolve(_outDir),
    compiler: _compiler,
  };
}

export async function loadConfig(): Promise<AstroneerConfig> {
  try {
    const config = await import(CONFIG_FILE).then((m) => m.default);
    return config;
  } catch (err) {
    Logger.error(
      'Unable to load config file. Please read https://astroneer.dev/docs/overview#astroneer-config to see more details.',
    );
    process.exit(1);
  }
}
