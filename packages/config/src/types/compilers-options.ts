export type CompilerOptions = SWCCompilerOptions | TSCCompilerOptions;

export type SWCCompilerOptions = {
  type?: 'swc';
  typeCheck?: boolean;
};

export type TSCCompilerOptions = {
  type?: 'tsc';
  typeCheck?: boolean;
};
