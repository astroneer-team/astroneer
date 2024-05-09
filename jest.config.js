/**@type {import('jest').Config} */
module.exports = {
  verbose: true,
  testEnvironment: 'node',
  detectOpenHandles: true,
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
};
