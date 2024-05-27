import { defineRule } from '../utils/define-rule';

const url =
  'https://astroneer.dev/docs/meta-rules#no-default-route-handler-export';
const description = `Route handler must not be exported as default`;
const message = `${description}. See more at ${url}`;

const httpMethods = [
  'GET',
  'POST',
  'PUT',
  'DELETE',
  'PATCH',
  'OPTIONS',
  'HEAD',
  'CONNECT',
  'TRACE',
];

const whitelist: string[] = [];

export default defineRule({
  meta: {
    docs: {
      description,
      recommended: true,
      url,
    },
    type: 'problem',
    schema: [],
  },
  create(context) {
    return {
      ExportDefaultDeclaration(node) {
        if (node.declaration.type === 'ObjectExpression') {
          const properties = node.declaration.properties;
          for (const property of properties) {
            if (property.type === 'Property') {
              if (property.key.type === 'Identifier') {
                const key = property.key.name;
                if (httpMethods.includes(key) && !whitelist.includes(key)) {
                  context.report({
                    node: property.key,
                    message,
                  });
                }
              }
            }
          }
        }
      },
    };
  },
});
