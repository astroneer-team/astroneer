import { Rule } from 'eslint';
import noArrowFunctionRouteHandlers from './no-arrow-function-route-handlers';
import noDefaultRouteHandlerExport from './no-default-route-handler-export';
import noLowercaseRouteHandlers from './no-lowercase-route-handlers';
import noSyncRouteHandlers from './no-sync-route-handlers';

export default {
  'no-sync-route-handlers': noSyncRouteHandlers,
  'no-arrow-function-route-handlers': noArrowFunctionRouteHandlers,
  'no-default-route-handler-export': noDefaultRouteHandlerExport,
  'no-lowercase-route-handlers': noLowercaseRouteHandlers,
} satisfies Record<string, Rule.RuleModule>;
