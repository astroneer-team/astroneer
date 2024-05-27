#!/usr/bin/env node
import { Command } from 'commander';
import { buildCmd, devCmd, newCmd, startCmd } from './commands';

/**
 * The main function for the Astroneer CLI.
 * This function initializes the CLI and parses the command line arguments.
 */
async function astroneerCLI() {
  const pkg = await import('../package.json');

  new Command('astroneer')
    .description(pkg.description)
    .version(pkg.version)
    .addCommand(buildCmd)
    .addCommand(startCmd)
    .addCommand(devCmd)
    .addCommand(newCmd)
    .parse(process.argv);
}

astroneerCLI().catch((err) => {
  console.error(err);
  process.exit(1);
});

export * from './commands';
