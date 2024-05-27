import noSyncRouteHandlers from './no-sync-route-handlers';
import noArrowFunctionRouteHandlers from './no-arrow-function-route-handlers';
import noLowercaseRouteHandlers from './no-lowercase-route-handlers';
import noDefaultRouteHandlerExport from './no-default-route-handler-export';

export default {
  rules: {
    'no-sync-route-handlers': noSyncRouteHandlers,
    'no-arrow-function-route-handlers': noArrowFunctionRouteHandlers,
    'no-default-route-handler-export': noDefaultRouteHandlerExport,
    'no-lowercase-route-handlers': noLowercaseRouteHandlers,
  },
};
