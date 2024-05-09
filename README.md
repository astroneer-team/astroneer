<p align="center">
  <a href="https://astroneer.dev/" target="blank">
    <img src=".github/astroneer.svg" width="120" alt="Astroneer Logo" />
  </a>
</p>
<h2 align="center">
  Astroneer.js
</h2>
<p align="center">
  <img alt="NPM Version" src="https://img.shields.io/npm/v/%40astroneer%2Fcore?style=for-the-badge&logo=npm&label=%20&color=%23000000">
  <img alt="NPM License" src="https://img.shields.io/npm/l/%40astroneer%2Fcore?style=for-the-badge&labelColor=%23000000&color=%233DA639">
  <img alt="NPM Downloads" src="https://img.shields.io/npm/dm/%40astroneer%2Fcore?style=for-the-badge&labelColor=000000&color=C5F74F">
</p>

## Description

**Astroneer is a framework for server-side application development in [Node.js]**. Its goal is to facilitate the creation of server-side applications by providing a simple and easy-to-understand project structure.

## Features

- **Lightweight**: Astroneer is a lightweight framework, which means it has a small footprint and is easy to install. It is ideal for any project, regardless of its size.
- **Native HTTP server**: Astroneer uses the native HTTP server provided by Node.js. The server bootstrap is defined in the [server.ts] file, allowing you to take full control of the server configuration.
- **File-based routing**: Astroneer uses the file system to define the routes of the application. This makes it easy to create and maintain routes. When a file is added to the **routes** directory it is automatically available as a route.
- **Middleware support**: Astroneer supports middleware functions that can be used to perform tasks before or after the route handler is executed.

## Documentation

Check out the full documentation at [website].

## Contributing

Contributions with Astroneer are welcome and encouraged! To get started, please review our [contribution guidelines](CONTRIBUTING.md) to make sure you have a smooth experience contributing to Astroneer.

## Authors

Astroneer is developed and maintained by [Lucas Larangeira].

[Lucas Larangeira]: https://lucaslarangeira.com
[website]: https://astroneer.dev
[server.ts]: templates/default/src/server.ts
[Node.js]: https://nodejs.org/en/
