#!/usr/bin/env node
import { Command } from 'commander';
import { description, name, version } from '../package.json';
import { createAstroneerApp } from './create-astroneer-app';
import { deleteTemplatesFolder } from './helpers/delete-templates-folder';
import picocolors from 'picocolors';

function program() {
  new Command(name)
    .description(description)
    .version(version)
    .argument('[name]', 'Name of the project')
    .action(createAstroneerApp)
    .parse(process.argv);
}

try {
  program();
} catch (error) {
  console.error(
    picocolors.red(
      `⚠️  An error occurred while creating the Astroneer.js app:\n\n${error.message}`,
    ),
  );

  deleteTemplatesFolder();
  process.exit(1);
}
