import { spawnSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync } from 'fs';
import path from 'path';
import picocolors from 'picocolors';
import prompts from 'prompts';
import simpleGit from 'simple-git';
import {
  changeProjectName,
  copyTemplateFiles,
  downloadTemplates,
  showSpinner,
  showSpinnerWithPromise,
} from './helpers';
import { deleteTemplatesFolder } from './helpers/delete-templates-folder';

export async function createAstroneerApp(projectName?: string) {
  const packageJsonPath = path.resolve(__dirname, '../package.json');
  const packageJson = readFileSync(packageJsonPath, 'utf-8');
  const { version } = JSON.parse(packageJson);
  console.log(
    picocolors.blue(
      `♦️  Astroneer.js CLI v${version} - Create Astroneer.js App\n`,
    ),
  );

  const templates = await showSpinnerWithPromise(
    () => downloadTemplates(),
    'Downloading Astroneer.js templates...',
  );

  const answers = await prompts(
    [
      {
        type: () => (projectName ? null : 'text'),
        name: 'projectName',
        message: `What is the name of the project?`,
        initial: 'my-astroneer-app',
        validate: (value) => (value ? true : 'Project name is required'),
      },
      {
        type: 'select',
        name: 'selectedTemplate',
        message: `Which ${picocolors.blue('`template`')} would you like to use?`,
        choices: templates.map((template) => ({
          title: template.name,
          value: template.path,
          description: template.description,
        })),
      },
      {
        type: 'select',
        name: 'packageManager',
        message: `Which ${picocolors.blue('`package manager`')} would you like to use?`,
        choices: [
          { title: 'npm', value: 'npm' },
          { title: 'yarn', value: 'yarn' },
        ],
      },
      {
        type: 'toggle',
        name: 'git',
        message: `Initialize a ${picocolors.blue('`git`')} repository?`,
        initial: true,
        active: 'yes',
        inactive: 'no',
      },
      {
        type: 'toggle',
        name: 'install',
        message: `Install ${picocolors.blue('`dependencies`')} after creating the project?`,
        initial: true,
        active: 'yes',
        inactive: 'no',
      },
    ],
    {
      onCancel() {
        throw new Error('Operation cancelled by the user');
      },
    },
  );

  const _projectName = projectName || answers.projectName;
  const useRootDir = projectName === '.' || projectName === './';
  const projectDir = useRootDir ? process.cwd() : path.resolve(_projectName);

  if (!useRootDir) {
    if (existsSync(projectDir)) {
      const { overwrite } = await prompts({
        type: 'confirm',
        name: 'overwrite',
        message: `Directory ${picocolors.blue(`\`${_projectName}\``)} already exists. Do you want to overwrite it?`,
        initial: false,
      });

      if (!overwrite) {
        throw new Error(`Directory ${_projectName} already exists.`);
      }
    }

    mkdirSync(projectDir, { recursive: true });
  }

  const { stop } = showSpinner('Copying template files...');

  copyTemplateFiles({
    srcDir: answers.selectedTemplate,
    destDir: projectDir,
  });

  stop();

  changeProjectName({
    projectName: _projectName,
    projectPath: projectDir,
  });

  if (answers.git) {
    const git = simpleGit(projectDir);
    await git.init();
    await git.add('.');
    await git.commit('Initial commit');
  }

  if (answers.install) {
    const cmd = answers.packageManager === 'yarn' ? 'yarn' : 'npm';

    const { stop } = showSpinner('Installing dependencies...');

    const installProcess = spawnSync(cmd, {
      cwd: projectDir,
      stdio: 'inherit',
      shell: true,
    });

    stop();

    if (installProcess.status !== 0) {
      throw new Error(
        `An error occurred while installing dependencies. Please install the dependencies manually by running ${picocolors.blue(
          `\`${cmd}\``,
        )} in the project directory.`,
      );
    }
  }

  console.log(
    picocolors.green(
      `\nSuccessfully created Astroneer.js app in ${picocolors.blue(
        `\`${_projectName}\``,
      )}`,
    ),
  );

  const runCommand = answers.packageManager === 'yarn' ? 'yarn' : 'npm run';

  console.log(picocolors.blue(`\nGet started with the following commands:\n`));
  console.log(picocolors.gray(`  cd ${_projectName}`));
  console.log(picocolors.gray(`  ${runCommand} dev`));
  console.log(
    picocolors.blue(
      `\nFor more information, check out the Astroneer.js documentation at ${picocolors.underline(
        'https://astroneer.dev/docs',
      )}\n`,
    ),
  );
  console.log(picocolors.green('Good luck, Astroneer! 🚀\n'));

  deleteTemplatesFolder();
}
