export type CompilerOptions = SWCCompilerOptions | TSCCompilerOptions;

export type SWCCompilerOptions = {
  type?: 'swc';
  swcrcFilePath?: string;
  typeCheck?: boolean;
};

export type TSCCompilerOptions = {
  type?: 'tsc';
  typeCheck?: boolean;
};
