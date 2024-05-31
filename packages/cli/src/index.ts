#!/usr/bin/env node
import { Command } from 'commander';
import { readFileSync } from 'fs';
import path from 'path';
import picocolors from 'picocolors';
import { buildCmd, devCmd, startCmd } from './commands';

async function astroneerCLI() {
  const packageJsonPath = path.resolve(__dirname, '../package.json');
  const packageJson = readFileSync(packageJsonPath, 'utf-8');
  const { version, description, name } = JSON.parse(packageJson);
  console.log(picocolors.blue(`>_  Astroneer.js CLI v${version}\n`));
  const program = new Command(name)
    .description(description)
    .version(version)
    .usage('<command> [options]')
    .addCommand(buildCmd)
    .addCommand(startCmd)
    .addCommand(devCmd);

  await program.parseAsync(process.argv);

  if (!process.argv.slice(2).length) {
    program.outputHelp();
  }
}

astroneerCLI();
