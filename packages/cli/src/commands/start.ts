import { Command } from 'commander';
import { printVersion } from '../helpers/print-version';

const startCmd = new Command('start')
  .description('Start Astroneer app in production mode')
  .action(async () => {
    await printVersion();
  });

export default startCmd;
