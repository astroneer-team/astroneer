/**@type {import('jest').Config} */
module.exports = {
  verbose: true,
  testEnvironment: 'node',
  detectOpenHandles: true,
  testRegex: '.*\\.e2e-spec\\.ts$',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
};
