import { ESLintUtils, TSESTree } from '@typescript-eslint/utils';
import path from 'path';

const createRule = ESLintUtils.RuleCreator(
  () => 'https://astroneer.dev/docs/meta-rules#no-default-route-handler-export',
);

const noDefaultRouteHandlerExport = createRule({
  defaultOptions: [],
  name: 'no-default-route-handler-export',
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent exporting route handlers as default exports',
      requiresTypeChecking: false,
    },
    messages: {
      noDefaultRouteHandlerExport:
        'Route handlers should not be exported as default exports',
    },
    schema: [],
  },
  create(context) {
    const filePath = context.filename;

    if (!filePath.includes(path.join('src', 'routes'))) {
      return {};
    }

    return {
      ExportDefaultDeclaration(node: TSESTree.ExportDefaultDeclaration) {
        context.report({
          node,
          messageId: 'noDefaultRouteHandlerExport',
        });
      },
    };
  },
});

export default noDefaultRouteHandlerExport;
