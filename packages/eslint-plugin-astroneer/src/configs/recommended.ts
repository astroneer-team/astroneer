export default {
  env: {
    es2024: true,
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 'latest',
  },
  plugins: ['astroneer'],
  rules: {
    'astroneer/no-default-route-handler-export': 'error',
    'astroneer/no-sync-route-handlers': 'error',
    'astroneer/only-export-http-methods': 'error',
  },
};
