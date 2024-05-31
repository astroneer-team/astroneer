import { spawnSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import picocolors from 'picocolors';
import prompts from 'prompts';
import { changeProjectName, copyTemplateFiles } from './helpers';
import { deleteTemplatesFolder } from './helpers/delete-templates-folder';
import { doQuestions } from './steps/do-questions';
import { initGitRepository } from './steps/init-git-repository';
import { loadTemplates } from './steps/load-templates';
import { printStatus } from './steps/print-status';

export async function createAstroneerApp(projectName?: string) {
  printStatus();
  const templates = await loadTemplates();
  const answers = await doQuestions({ projectName, templates });
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
        console.error(
          picocolors.red(
            `Operation cancelled. Astroneer.js app was not created.`,
          ),
        );

        process.exit(1);
      }
    }

    mkdirSync(projectDir, { recursive: true });
  }

  copyTemplateFiles({
    srcDir: answers.selectedTemplate,
    destDir: projectDir,
  });

  changeProjectName({
    projectName: _projectName,
    projectPath: projectDir,
  });

  if (answers.install) {
    const cmd = answers.packageManager === 'yarn' ? 'yarn' : 'npm install';
    const installProcess = spawnSync(`${cmd}`, {
      cwd: projectDir,
      stdio: 'inherit',
      shell: true,
    });

    if (installProcess.status !== 0) {
      console.error(
        picocolors.red(
          `Failed to install dependencies. Please run ${picocolors.blue(
            `\`${cmd} install\``,
          )} manually.`,
        ),
      );
    }
  }

  if (answers.git) initGitRepository(projectDir);

  console.log(
    picocolors.green(
      `\nSuccessfully created Astroneer.js app in ${picocolors.cyan(
        `\`${_projectName}\``,
      )}`,
    ),
  );
  console.log(picocolors.green('Good luck, Astroneer! 🚀\n'));

  deleteTemplatesFolder();
}
