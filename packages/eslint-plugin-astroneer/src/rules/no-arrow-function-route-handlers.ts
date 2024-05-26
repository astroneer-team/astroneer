import { defineRule } from '../utils/define-rule';

const url =
  'https://astroneer.dev/docs/meta-rules#no-arrow-function-route-handlers';
const description = `Route handler must not be an arrow function`;
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

const whitelist = ['middlewares'];

export = defineRule({
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
      Property(node) {
        if (node.key.type === 'Identifier') {
          const key = node.key.name;
          if (httpMethods.includes(key) && !whitelist.includes(key)) {
            if (node.value.type === 'ArrowFunctionExpression') {
              context.report({
                node: node.value,
                message,
              });
            }
          }
        }
      },
    };
  },
});
