import picocolors from 'picocolors';
import prompts from 'prompts';

type QuestionsDependencies = {
  projectName?: string;
  templates: Array<{
    name: string;
    path: string;
    description: string;
  }>;
};

export async function doQuestions({
  projectName,
  templates,
}: QuestionsDependencies) {
  return await prompts(
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
        console.error(
          picocolors.red(
            `Operation cancelled. Astroneer.js app was not created.`,
          ),
        );

        process.exit(1);
      },
    },
  );
}
