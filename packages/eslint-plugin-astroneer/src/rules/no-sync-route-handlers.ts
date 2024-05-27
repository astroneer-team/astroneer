import { ESLintUtils, TSESTree } from '@typescript-eslint/utils';
import { isRouteHandler } from '../utils/is-route-handler';

const createRule = ESLintUtils.RuleCreator(
  () => 'https://astroneer.dev/docs/meta-rules#no-non-async-route-handlers',
);

const noNonAsyncRouteHandlers = createRule({
  defaultOptions: [],
  name: 'no-non-async-route-handlers',
  meta: {
    type: 'problem',
    fixable: 'code',
    docs: {
      description: 'Route handlers must be asynchronous',
      requiresTypeChecking: false,
    },
    messages: {
      noNonAsyncRouteHandlers:
        'Route handlers must be defined as asynchronous functions',
    },
    schema: [],
  },
  create(context) {
    const filePath = context.filename;

    if (!isRouteHandler(filePath)) {
      return {};
    }

    const whenExportIsArrowFunction = (
      node: TSESTree.ArrowFunctionExpression,
    ) => {
      if (node.parent?.type === 'VariableDeclarator') {
        const { id } = node.parent;
        if (id.type === 'Identifier') {
          if (!node.async) {
            context.report({
              node: id,
              messageId: 'noNonAsyncRouteHandlers',
              fix(fixer) {
                return fixer.insertTextBefore(node, 'async ');
              },
            });
          }
        }
      }
    };

    const whenExportIsFunctionDeclaration = (
      node: TSESTree.FunctionDeclaration,
    ) => {
      if (!node.async) {
        context.report({
          node: node.id || node,
          messageId: 'noNonAsyncRouteHandlers',
          fix(fixer) {
            return fixer.insertTextBefore(node, 'async ');
          },
        });
      }
    };

    return {
      ExportNamedDeclaration(node) {
        if (node.declaration?.type === 'FunctionDeclaration') {
          whenExportIsFunctionDeclaration(node.declaration);
        }

        if (node.declaration?.type === 'VariableDeclaration') {
          for (const declaration of node.declaration.declarations) {
            if (declaration.init?.type === 'ArrowFunctionExpression') {
              whenExportIsArrowFunction(declaration.init);
            }
          }
        }
      },
    };
  },
});

export default noNonAsyncRouteHandlers;
