import { Octokit } from '@octokit/rest';
import { Command } from 'commander';
import { cpSync, createWriteStream, existsSync, readdirSync, rmSync } from 'fs';
import path, { resolve } from 'path';
import { pipeline, Readable } from 'stream';
import { extract, list } from 'tar';
import { promisify } from 'util';
import { showSpinner } from '../helpers/show-spinner';

const asyncPipeline = promisify(pipeline);

async function downloadAstroneerTemplates() {
  const octokit = new Octokit();

  try {
    const tar = await octokit.repos.downloadTarballArchive({
      owner: 'lukearch',
      repo: 'astroneer',
      ref: 'master',
    });

    const stream = new Readable();
    stream.push(Buffer.from(tar.data as ArrayBuffer));
    stream.push(null);

    let tmp = '';
    const rootDir = resolve(__dirname, '..');
    const targetDir = resolve(rootDir, 'templates');
    const tarPath = resolve(rootDir, 'templates.tar.gz');
    const writeStream = createWriteStream(tarPath);

    await asyncPipeline(stream, writeStream);

    await list({
      file: tarPath,
      onentry(entry) {
        tmp = path.resolve(rootDir, entry.path.split('/')[0]);
      },
    });

    await extract({
      file: tarPath,
      cwd: rootDir,
      filter(path, entry) {
        const newPath = path.split('/').slice(1).join('/');
        const newEntry = { ...entry, path: newPath };
        return newEntry.path.split('/')?.[0] === 'templates';
      },
    });

    if (existsSync(targetDir)) {
      rmSync(targetDir, { recursive: true });
    }

    cpSync(resolve(rootDir, 'templates'), targetDir);
    rmSync(tarPath);
    rmSync(resolve(rootDir, 'templates'));
    rmSync(tmp, { recursive: true });

    return readdirSync(targetDir).map((dir) => ({
      name: dir,
      path: resolve(targetDir, dir),
    }));
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

const newCmd = new Command('new')
  .description('Create a new Astroneer project')
  .action(async () => {
    const spinner = showSpinner('Downloading Astroneer templates...');
    const templates = await downloadAstroneerTemplates();
    spinner.stop();
  });

export default newCmd;
