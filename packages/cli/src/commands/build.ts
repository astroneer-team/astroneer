import { AstroneerRouter, scan, SOURCE_FOLDER } from '@astroneer/core';
import CliTable3 from 'cli-table3';
import { Command } from 'commander';
import path from 'path';
import picocolors from 'picocolors';
import { compile } from '../compiler';
import { colorRouteMethod } from '@astroneer/core';
import { printVersion } from '../helpers/print-version';

export async function build() {
  await printVersion();
  const router = new AstroneerRouter();
  const routes: string[] = [];

  await scan({
    rootDir: SOURCE_FOLDER,
    include: [/\/routes\/.*\.(js|ts)?$/, /\/server\.(js|ts)?$/],
    async onFile(file) {
      const timestamp = new Date().getTime();
      const outfile = await compile(file).then((outfile) =>
        path.relative(process.cwd(), outfile),
      );

      console.log(
        `   ${picocolors.green('✔')}  ${picocolors.gray(outfile)} ${picocolors.blue(
          `(${new Date().getTime() - timestamp}ms)`,
        )}`,
      );

      routes.push(path.resolve(process.cwd(), outfile));
    },
  });

  router.reset();
  const manifest = await router.preloadAllRoutes(routes);

  console.log(picocolors.green('\n✨ Routes'));

  const table = new CliTable3({
    head: [
      picocolors.white('Path'),
      picocolors.white('Method'),
      picocolors.white('Raw Size'),
    ],
    chars: { mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
  });

  manifest.staticRoutes
    ?.concat(manifest.dynamicRoutes || [])
    .forEach((route) => {
      const methods = route.methods.map((m) => colorRouteMethod(m)).join(' ');
      const rawSize = (route.rawSize / 1024).toFixed(2) + 'kb';

      table.push([
        picocolors.cyan(route.page),
        picocolors.gray(methods),
        picocolors.magenta(rawSize),
      ]);
    });

  console.log(table.toString());
  console.log(
    '\n   ' +
      picocolors.green('✔') +
      '  ' +
      picocolors.gray('Astroneer app built successfully!'),
  );
}

const buildCmd = new Command('build')
  .description('Build Astroneer app for production')
  .action(build.bind(null));

export default buildCmd;
