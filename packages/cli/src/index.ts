#!/usr/bin/env node
import { Command } from 'commander';
import { readFileSync } from 'fs';
import path from 'path';
import picocolors from 'picocolors';
import { buildCmd, devCmd, startCmd } from './commands';

/**
 * The main function for the Astroneer CLI.
 * This function initializes the CLI and parses the command line arguments.
 */
async function astroneerCLI() {
  const packageJsonPath = path.resolve(__dirname, '../package.json');
  const packageJson = readFileSync(packageJsonPath, 'utf-8');
  const { version, description, name } = JSON.parse(packageJson);
  console.log(picocolors.blue(`♦️  Astroneer.js CLI v${version}`));

  new Command(name)
    .description(description)
    .version(version)
    .addCommand(buildCmd)
    .addCommand(startCmd)
    .addCommand(devCmd)
    .parse(process.argv);
}

astroneerCLI();
