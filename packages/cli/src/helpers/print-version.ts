import picocolors from 'picocolors';

export async function printVersion() {
  const pkg = await import('../../package.json');
  console.log(picocolors.green(`♦️  Proton.js ${pkg.version}\n`));
}
