#!/usr/bin/env node

import { Command } from 'commander';
import buildCmd from './commands/build';

async function astro() {
  const pkg = await import('../package.json');

  new Command('astro')
    .description(pkg.description)
    .version(pkg.version)
    .addCommand(buildCmd)
    .parse(process.argv);
}

astro().catch((err) => {
  console.error(err);
  process.exit(1);
});
