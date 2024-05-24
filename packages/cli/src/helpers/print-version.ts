import picocolors from 'picocolors';

/**
 * Prints the version of Astroneer.js.
 * @returns {Promise<void>} A promise that resolves once the version is printed.
 */
export async function printVersion() {
  const pkg = await import('../../package.json');
  console.log(picocolors.blue(`\n♦️  Astroneer.js  ${pkg.version}\n`));
}
