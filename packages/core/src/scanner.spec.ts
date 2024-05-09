import { scan } from './scanner';

describe('Scanner', () => {
  it('should scan a directory and return a list of files', async () => {
    const files: string[] = [];

    await scan({
      rootDir: process.cwd(),
      include: [/\.ts$/],
      onFile: (path) => {
        files.push(path);
      },
      exclude: [/node_modules/],
    });

    expect(files).toContain(__filename);
  });

  it('should not scan excluded regex', async () => {
    const files: string[] = [];

    await scan({
      rootDir: process.cwd(),
      include: [/\.ts$/],
      onFile: (path) => {
        files.push(path);
      },
      exclude: [/node_modules/, /packages/],
    });

    expect(files).not.toContain(__filename);
  });

  it('should not scan files that do not match the include regex', async () => {
    const files: string[] = [];

    await scan({
      rootDir: process.cwd(),
      include: [/\.js$/],
      onFile: (path) => {
        files.push(path);
      },
      exclude: [/node_modules/],
    });

    expect(files).not.toContain(__filename);
  });

  it('should not scan files that do not exist', async () => {
    const files: string[] = [];

    await scan({
      rootDir: '/nonexistent',
      include: [/\.ts$/],
      onFile: (path) => {
        files.push(path);
      },
    });

    expect(files).toHaveLength(0);
  });
});
