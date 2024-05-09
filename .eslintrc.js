/**@type {import('eslint').Linter.Config} */

const { join } = require('path');

module.exports = {
  root: true,
  env: {
    node: true,
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: ['plugin:@typescript-eslint/recommended', 'prettier'],
  overrides: [
    {
      files: ['**/*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: join(__dirname, 'tsconfig.build.json'),
        sourceType: 'module',
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unused-vars': 'warn',
      },
      overrides: [
        {
          files: ['src/**/*.spec.ts'],
          parserOptions: {
            project: join(__dirname, 'tsconfig.spec.json'),
            sourceType: 'module',
          },
          env: {
            jest: true,
          },
        },
      ],
    },
  ],
  ignorePatterns: ['.*.js'],
};
