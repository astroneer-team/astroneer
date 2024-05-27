/**@type {import('eslint').Linter.Config} */

const { join } = require('path');

module.exports = {
  root: true,
  env: {
    node: true,
    jest: true,
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'astroneer'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:astroneer/recommended',
    'prettier',
  ],
  overrides: [
    {
      files: ['**/*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: join(__dirname, 'tsconfig.json'),
        sourceType: 'module',
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unused-vars': 'warn',
      },
    },
  ],
  ignorePatterns: ['*.js'],
};
