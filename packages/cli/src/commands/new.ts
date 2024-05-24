import { Octokit } from '@octokit/rest';
import cp from 'child_process';
import { Command } from 'commander';
import {
  cpSync,
  createWriteStream,
  existsSync,
  mkdirSync,
  promises,
  readdirSync,
  rmSync,
  statSync,
} from 'fs';
import path from 'path';
import picocolors from 'picocolors';
import prompts from 'prompts';
import simpleGit from 'simple-git';
import { pipeline, Readable } from 'stream';
import { extract, list } from 'tar';
import { promisify } from 'util';
import { showSpinnerWithPromise } from '../helpers/show-spinner';

const OWNER = 'astroneer-team';
const REPO = 'astroneer-templates';
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
  });

  return tmp;
}

async function copyTemplates(tmp: string, targetDir: string): Promise<void> {
  if (existsSync(targetDir)) {
    rmSync(targetDir, { recursive: true });
  }

  cpSync(path.resolve(tmp), targetDir, {
    recursive: true,
  });
}

async function downloadTemplates() {
  const octokit = new Octokit();
  const rootDir = path.resolve(__dirname, '..');
  const targetDir = path.resolve(rootDir, TARGET_DIR_NAME);
  const tarPath = path.resolve(rootDir, TAR_FILE_NAME);

  try {
    const stream = await downloadTarball(octokit);
    const tmp = await extractTarball(stream, tarPath, rootDir);
    await copyTemplates(tmp, targetDir);
    rmSync(tarPath);
    rmSync(tmp, { recursive: true });

    const templates = readdirSync(targetDir).filter((dir) => {
      if (statSync(path.resolve(targetDir, dir)).isDirectory()) {
        return true;
      }
    });

    return templates.map((template) => ({
      name: template,
      path: path.resolve(targetDir, template),
    }));
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

export async function copyDir(srcDir: string, destDir: string) {
  await promises.mkdir(destDir, { recursive: true });

  const entries = await promises.readdir(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await promises.copyFile(srcPath, destPath);
    }
  }
}

/**
 * Starts the server for creating a new Astroneer.js project.
 *
 * @param name - The name of the project.
 * @returns A Promise that resolves when the server is started.
 */
async function newProject(name: string) {
  const templates = await showSpinnerWithPromise(
    () => downloadTemplates(),
    'Downloading Astroneer.js templates...',
  );

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

  const rootDir = path.resolve(process.cwd(), name);
  mkdirSync(rootDir, { recursive: true });
  await copyDir(answers.template.path, rootDir);

  if (answers.git) {
    const git = simpleGit(rootDir);
    await git.init();
    await git.add('.');
    await git.commit('Initial commit');
  }

  if (answers.install) {
    const cmd = answers.packageManager === 'yarn' ? 'yarn' : 'npm';

    const installPackages = new Promise<void>((resolve, reject) => {
      const child = cp.exec(`${cmd} install`, {
        cwd: rootDir,
      });

      child.on('error', reject);
      child.on('exit', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Failed to install dependencies with code ${code}`));
        }
      });
    });

    await showSpinnerWithPromise(
      () => installPackages,
      'Installing dependencies...',
    );
  }

  console.log(
    picocolors.blue(`\nYour Astroneer.js project is already set up!`),
  );
  console.log(
    picocolors.blue(`\nTo get started, run the following commands:\n`),
  );
  console.log(picocolors.cyan(`  cd ${name}`));
  console.log(picocolors.cyan(`  astroneer dev\n`));
  console.log(picocolors.blue('Good luck, Astroneer! 🚀'));
}

/**
 * Command to create a new Astroneer.js project.
 */
const newCmd = new Command('new')
  .description('Create a new Astroneer.js project')
  .argument('<name>', 'Name of the project')
  .action(newProject);

export { newProject };
export default newCmd;
