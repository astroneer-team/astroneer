export type CompilerOptions =
  | ESbuildCompilerOptions
  | SWCCompilerOptions
  | TSCCompilerOptions
  | WebpackCompilerOptions;

export type ESbuildCompilerOptions = {
  type?: 'esbuild';
  bundle?: boolean;
  external?: string[];
  typeCheck?: boolean;
};

export type SWCCompilerOptions = {
  type?: 'swc';
  swcrcFilePath?: string;
  typeCheck?: boolean;
};

export type TSCCompilerOptions = {
  type?: 'tsc';
};

export type WebpackCompilerOptions = {
  type?: 'webpack';
  configPath?: string;
};
