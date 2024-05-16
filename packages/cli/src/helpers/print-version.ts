import picocolors from 'picocolors';

export async function printVersion() {
  const pkg = await import('../../package.json');
  console.log(picocolors.blue(`\n♦️  Astroneer.js  ${pkg.version}\n`));
}
