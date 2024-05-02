import { Octokit } from '@octokit/rest';
import { Command } from 'commander';
import fs, {
  cpSync,
  createWriteStream,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
} from 'fs';
import path, { resolve } from 'path';
import prompts from 'prompts';
import { pipeline, Readable } from 'stream';
import { extract, list } from 'tar';
import { promisify } from 'util';
import { showSpinner } from '../helpers/show-spinner';
const OWNER = 'lukearch';
const REPO = 'astroneer';
const REF = 'master';
const TARGET_DIR_NAME = 'templates';
const TAR_FILE_NAME = 'templates.tar.gz';

const asyncPipeline = promisify(pipeline);

async function downloadTarball(octokit: Octokit): Promise<Readable> {
  const tar = await octokit.repos.downloadTarballArchive({
    owner: OWNER,
    repo: REPO,
    ref: REF,
  });

  const stream = new Readable();
  stream.push(Buffer.from(tar.data as ArrayBuffer));
  stream.push(null);

  return stream;
}

async function extractTarball(
  stream: Readable,
  tarPath: string,
  rootDir: string,
): Promise<string> {
  let tmp = '';
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
      return newEntry.path.split('/')?.[0] === TARGET_DIR_NAME;
    },
  });

  return tmp;
}

async function copyTemplates(tmp: string, targetDir: string): Promise<void> {
  if (existsSync(targetDir)) {
    rmSync(targetDir, { recursive: true });
  }

  cpSync(resolve(tmp, TARGET_DIR_NAME), targetDir, {
    recursive: true,
  });
}

async function downloadTemplates() {
  const octokit = new Octokit();
  const rootDir = resolve(__dirname, '..');
  const targetDir = resolve(rootDir, TARGET_DIR_NAME);
  const tarPath = resolve(rootDir, TAR_FILE_NAME);

  try {
    const stream = await downloadTarball(octokit);
    const tmp = await extractTarball(stream, tarPath, rootDir);
    await copyTemplates(tmp, targetDir);
    rmSync(tarPath);
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

export async function copyDir(srcDir: string, destDir: string) {
  await fs.promises.mkdir(destDir, { recursive: true });

  const entries = await fs.promises.readdir(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.promises.copyFile(srcPath, destPath);
    }
  }
}

const newCmd = new Command('new')
  .description('Create a new Astroneer.js project')
  .argument('<name>', 'Name of the project')
  .action(async (name) => {
    const spinner = showSpinner('Downloading Astroneer.js templates...');
    const templates = await downloadTemplates().finally(() => spinner.stop());

    const answers = await prompts(
      [
        {
          type: 'select',
          name: 'template',
          message: `Which app template would you like to use?`,
          choices: templates.map((template) => ({
            title: template.name,
            value: template,
          })),
        },
        {
          type: 'select',
          name: 'packageManager',
          message: 'Which package manager would you like to use?',
          choices: [
            { title: 'npm', value: 'npm' },
            { title: 'yarn', value: 'yarn' },
          ],
        },
        {
          type: 'toggle',
          name: 'git',
          message: 'Initialize a git repository?',
          initial: true,
          active: 'yes',
          inactive: 'no',
        },
        {
          type: 'toggle',
          name: 'install',
          message: 'Install dependencies?',
          initial: true,
          active: 'yes',
          inactive: 'no',
        },
      ],
      {
        onCancel: () => {
          console.log('Operation cancelled');
          process.exit(1);
        },
      },
    );

    const rootDir = resolve(process.cwd(), name);
    mkdirSync(rootDir, { recursive: true });
    await copyDir(answers.template.path, rootDir);

    const pkg = await import('../../package.json');
  });

export default newCmd;
