import { Octokit } from '@octokit/rest';
import { readdirSync, rmSync, statSync } from 'fs';
import path from 'path';
import { copyTemplates } from './copy-templates';
import { downloadTarball } from './download-tarball';
import { extractTarball } from './extract-tarball';

export async function downloadTemplates() {
  const octokit = new Octokit();
  const rootDir = path.resolve(__dirname, '..');
  const targetDir = path.resolve(rootDir, '.templates');
  const tarPath = path.resolve(rootDir, 'templates.tar.gz');

  try {
    const stream = await downloadTarball(octokit);
    const tmp = await extractTarball({ stream, tarPath, rootDir });
    await copyTemplates(tmp, targetDir);
    rmSync(tarPath, { recursive: true });
    rmSync(tmp, { recursive: true });

    const templates = readdirSync(targetDir).filter((dir) =>
      statSync(path.resolve(targetDir, dir)).isDirectory(),
    );

    return await Promise.all(
      templates.map(async (template) => {
        const {
          description,
        }: {
          description: string;
        } = await import(path.resolve(targetDir, template, 'package.json'));

        return {
          name: template,
          path: path.resolve(targetDir, template),
          description,
        };
      }),
    );
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
