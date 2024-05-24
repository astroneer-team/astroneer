import fs from 'fs';
import path from 'path';

/**
 * Creates a file at the specified filePath with the given content.
 * If the file already exists, it will be overwritten unless the `overwrite` parameter is set to `false`.
 * If the directory for the filePath does not exist, it will be created recursively.
 *
 * @param filePath - The path where the file should be created.
 * @param content - The content of the file.
 * @param overwrite - (Optional) Specifies whether to overwrite an existing file. Default is `false`.
 */
export function createFile<T>({
  filePath,
  content,
  overwrite = false,
}: {
  filePath: string;
  content: T;
  overwrite?: boolean;
}) {
  const directory = path.dirname(filePath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  if (overwrite || !fs.existsSync(filePath)) {
    fs.writeFileSync(
      filePath,
      typeof content === 'string' ? content : JSON.stringify(content, null, 2),
      'utf-8',
    );
  }
}
