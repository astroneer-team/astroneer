export default {
  extends: ['./configs/base'],
  rules: {
    '@astroneer/no-arrow-function-route-handlers': 'error',
    '@astroneer/no-default-route-handlers-export': 'error',
    '@astroneer/no-lowercase-route-handlers': 'error',
    '@astroneer/no-sync-route-handlers': 'error',
  },
};
