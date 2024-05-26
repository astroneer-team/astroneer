module.exports = {
  rules: {
    'no-sync-route-handlers': require('./rules/no-sync-route-handlers'),
    'no-arrow-function-route-handlers': require('./rules/no-arrow-function-route-handlers'),
    'no-async-function-route-handlers': require('./rules/no-async-function-route-handlers'),
    'no-default-route-handlers-export': require('./rules/no-default-route-handler-export'),
  },
  configs: {
    recommended: {
      plugins: ['@astroneer/astroneer'],
      rules: {
        '@astroneer/astroneer/no-sync-route-handlers': 'error',
        '@astroneer/astroneer/no-arrow-function-route-handlers': 'error',
        '@astroneer/astroneer/no-async-function-route-handlers': 'error',
        '@astroneer/astroneer/no-default-route-handlers-export': 'error',
      },
    },
  },
};
