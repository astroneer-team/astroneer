import fs from 'fs';
import path from 'path';

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
