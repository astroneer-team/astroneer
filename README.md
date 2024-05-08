## Description

**Astroneer is a framework for server-side application development in [Node.js]**. Its goal is to facilitate the creation of server-side applications by providing a simple and easy-to-understand project structure.

## Features

- **Lightweight**: Astroneer is a lightweight framework, which means it has a small footprint and is easy to install. It is ideal for any project, regardless of its size.
- **Native HTTP server**: Astroneer uses the native HTTP server provided by Node.js. The server bootstrap is defined in the [server.ts] file, allowing you to take full control of the server configuration.
- **File-based routing**: Astroneer uses the file system to define the routes of the application. This makes it easy to create and maintain routes. When a file is added to the **routes** directory it is automatically available as a route.

  ```ts
  // routes/hello.ts
  import { Request, Response } from '@astroneer/core';

  // GET /hello
  export function GET(req: Request, res: Response) {
    res.send('Hello, from Astroneer! 🚀');
  }
  ```

- **Middleware support**: Astroneer supports middleware functions that can be used to perform tasks before or after the route handler is executed.

  ```ts
  // routes/hello.ts
  // ...

  export const middlewares = [
    (req: Request, res: Response, next: Function) => {
      // do something before the route handler
      next();
    },
  ];
  ```

[server.ts]: templates/default/src/server.ts
[Node.js]: https://nodejs.org/en/
