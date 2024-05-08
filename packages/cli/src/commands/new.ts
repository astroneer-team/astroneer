import { Octokit } from '@octokit/rest';
import cp from 'child_process';
import { Command } from 'commander';
import fs, {
  cpSync,
  createWriteStream,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
} from 'fs';
import path, { resolve } from 'path';
import picocolors from 'picocolors';
import prompts from 'prompts';
import simpleGit from 'simple-git';
import { pipeline, Readable } from 'stream';
import { extract, list } from 'tar';
import { promisify } from 'util';
import { showSpinner } from '../helpers/show-spinner';

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

  cpSync(resolve(tmp), targetDir, {
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

    const templates = readdirSync(targetDir).filter((dir) => {
      if (statSync(resolve(targetDir, dir)).isDirectory()) {
        return true;
      }
    });

    return templates.map((template) => ({
      name: template,
      path: resolve(targetDir, template),
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

    if (answers.git) {
      const git = simpleGit(rootDir);
      await git.init();
      await git.add('.');
      await git.commit('Initial commit');
    }

    if (answers.install) {
      const spinner = showSpinner('Installing dependencies...');
      const cmd = answers.packageManager === 'yarn' ? 'yarn' : 'npm';

      await new Promise<void>((resolve, reject) => {
        const child = cp.exec(`${cmd} install`, {
          cwd: rootDir,
        });

        child.on('error', reject);
        child.on('exit', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(
              new Error(`Failed to install dependencies with code ${code}`),
            );
          }
        });
      }).finally(() => spinner.stop());
    }

    console.log(
      picocolors.green(`\nYour Astroneer.js project is already set up!`),
    );
    console.log(
      picocolors.green(`\nTo get started, run the following commands:\n`),
    );
    console.log(picocolors.cyan(`  cd ${name}`));
    console.log(picocolors.cyan(`  astroneer dev\n`));
    console.log(picocolors.green('Good luck, Astroneer! 🚀'));
  });

export default newCmd;
