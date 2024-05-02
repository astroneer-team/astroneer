import { SERVER_MODULE_PATH } from '@astroneer/core';
import { Command } from 'commander';
import path from 'path';
import { build } from './build';

const startCmd = new Command('start')
  .description('Start Astroneer app in production mode')
  .action(async () => {
    console.clear();
    await build();
    let serverModulePath = path.resolve(SERVER_MODULE_PATH);
  });

export default startCmd;
