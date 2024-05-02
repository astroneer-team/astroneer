#!/usr/bin/env node

import { Command } from 'commander';
import buildCmd from './commands/build';
import startCmd from './commands/start';
import devCmd from './commands/dev';

async function astro() {
  const pkg = await import('../package.json');

  new Command('astro')
    .description(pkg.description)
    .version(pkg.version)
    .addCommand(buildCmd)
    .addCommand(startCmd)
    .addCommand(devCmd)
    .parse(process.argv);
}

astro().catch((err) => {
  console.error(err);
  process.exit(1);
});
