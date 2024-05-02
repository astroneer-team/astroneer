#!/usr/bin/env node
import { Command } from 'commander';
import buildCmd from './commands/build';
import devCmd from './commands/dev';
import newCmd from './commands/new';
import startCmd from './commands/start';

async function astro() {
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

astro().catch((err) => {
  console.error(err);
  process.exit(1);
});
