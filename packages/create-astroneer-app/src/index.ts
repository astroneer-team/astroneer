#!/usr/bin/env node
import { Command } from 'commander';
import { description, name, version } from '../package.json';
import { createAstroneerApp } from './create-astroneer-app';

function program() {
  new Command(name)
    .description(description)
    .version(version)
    .argument('[name]', 'Name of the project')
    .action(async (name) => await createAstroneerApp(name))
    .parse(process.argv);
}

program();
