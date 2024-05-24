import { scan } from '@astroneer/core';
import { build } from './build';
import { createFile } from '@astroneer/common';

jest.mock('@astroneer/common', () => ({
  createFile: jest.fn(),
  Logger: jest.fn().mockImplementation(() => ({
    log: jest.fn(),
  })),
}));

jest.mock('@astroneer/core', () => ({
  DIST_FOLDER: jest.fn().mockResolvedValue('/path/to/dist'),
  SOURCE_FOLDER: '/path/to/packages/cli/src/commands/../..',
  scan: jest.fn(),
}));

jest.mock('../compiler', () => ({
  compile: jest.fn().mockResolvedValue('/path/to/dist/outFile.js'),
}));

jest.mock('rimraf', () => ({
  rimraf: jest.fn(),
}));

jest.mock('../helpers/print-version', () => ({
  printVersion: jest.fn(),
}));

describe('build', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should build the project', async () => {
    await build();

    expect(scan).toHaveBeenCalledWith({
      rootDir: '/path/to/packages/cli/src/commands/../..',
      include: [/\/?server\.ts$/, /\/routes(?:\/[^\/]+)*\/[^\/]+\.ts$/],
      exclude: [/\.d\.ts$/i, /\.spec\.(ts|js)$/i],
      onFile: expect.any(Function),
    });

    expect(createFile).toHaveBeenCalledWith({
      filePath: '/path/to/dist/main.js',
      content: "require('./server').default();",
      overwrite: true,
    });
  });
});
