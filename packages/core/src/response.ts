import { IncomingMessage, ServerResponse } from 'http';

export class Response {
  private readonly serverResponse: ServerResponse<IncomingMessage>;

  constructor(res: ServerResponse<IncomingMessage>) {
    this.serverResponse = res;
  }

  end(data: string) {
    this.serverResponse.end(data);
  }

  status(code: number) {
    this.serverResponse.statusCode = code;
    return this;
  }

  json(data: unknown) {
    this.serverResponse.setHeader('Content-Type', 'application/json');

    this.end(JSON.stringify(data));
  }

  send(data: unknown) {
    switch (typeof data) {
      case 'object':
        this.serverResponse.setHeader('Content-Type', 'application/json');
        break;
      default:
        this.serverResponse.setHeader('Content-Type', 'text/plain');
        break;
    }
  }

  setHeader(key: string, value: string) {
    this.serverResponse.setHeader(key, value);
  }

  writeHead(statusCode: number) {
    this.serverResponse.writeHead(statusCode);
  }
}
