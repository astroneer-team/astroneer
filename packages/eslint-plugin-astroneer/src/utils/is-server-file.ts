export function isServerFile(fileName: string): boolean {
  return fileName.endsWith('src/server.ts');
}
