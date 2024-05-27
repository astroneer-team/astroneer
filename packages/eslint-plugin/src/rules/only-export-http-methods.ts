import { ESLintUtils, TSESTree } from '@typescript-eslint/utils';
import { isRouteHandler } from '../utils/is-route-handler';

const httpMethods = [
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'HEAD',
  'OPTIONS',
  'TRACE',
  'CONNECT',
];

const createRule = ESLintUtils.RuleCreator(
  () => 'https://astroneer.dev/docs/meta-rules#only-export-http-methods',
);

const onlyExportHttpMethods = createRule({
  defaultOptions: [],
  name: 'only-export-http-methods',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Route handlers should only export functions named after HTTP methods',
      requiresTypeChecking: false,
    },
    messages: {
      onlyExportHttpMethods:
        'Route handlers should only export functions named after HTTP methods',
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
          if (!httpMethods.includes(id.name)) {
            context.report({
              node: id,
              messageId: 'onlyExportHttpMethods',
            });
          }
        }
      }
    };

    const whenExportIsFunctionDeclaration = (
      node: TSESTree.FunctionDeclaration,
    ) => {
      if (!httpMethods.includes(node.id?.name || '')) {
        context.report({
          node: node.id || node,
          messageId: 'onlyExportHttpMethods',
        });
      }
    };

    return {
      ExportNamedDeclaration(node) {
        if (node.declaration?.type === 'FunctionDeclaration') {
          whenExportIsFunctionDeclaration(node.declaration);
        } else if (node.declaration?.type === 'VariableDeclaration') {
          node.declaration.declarations.forEach((declaration) => {
            if (
              declaration.init?.type === 'ArrowFunctionExpression' &&
              declaration.id?.type === 'Identifier'
            ) {
              whenExportIsArrowFunction(declaration.init);
            }
          });
        }
      },
    };
  },
});

export default onlyExportHttpMethods;
