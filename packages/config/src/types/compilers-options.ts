export type CompilerOptions =
  | SWCCompilerOptions
  | TSCCompilerOptions
  | NCCCompilerOptions;

export type SWCCompilerOptions = {
  type?: 'swc';
  typeCheck?: boolean;
};

export type TSCCompilerOptions = {
  type?: 'tsc';
  typeCheck?: boolean;
};

export type NCCCompilerOptions = {
  type?: 'ncc';
  typeCheck?: boolean;
};
