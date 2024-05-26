export type ScanOptions = {
  rootDir: string;
  searchFor: RegExp[];
  ignore?: RegExp[];
  onlyRootDir?: boolean;
  onFile: (filePath: string) => Promise<void> | void;
};

export type ScanSyncOptions = ScanOptions & {
  onFile: (filePath: string) => void;
};
