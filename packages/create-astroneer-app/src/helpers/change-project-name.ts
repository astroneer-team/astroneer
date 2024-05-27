import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

export function changeProjectName({
  projectName,
  projectPath,
}: {
  projectName: string;
  projectPath: string;
}) {
  const packageJsonPath = path.resolve(projectPath, 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  packageJson.name = projectName;
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}
