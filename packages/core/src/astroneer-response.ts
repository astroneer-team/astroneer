import { IncomingMessage, ServerResponse } from 'http';

export class AstroneerResponse {
  private readonly primitiveResponseInstance: ServerResponse<IncomingMessage>;

  constructor(res: ServerResponse<IncomingMessage>) {
    this.primitiveResponseInstance = res;
  }

  end(data: string) {
    this.primitiveResponseInstance.end(data);
  }

  status(code: number) {
    this.primitiveResponseInstance.statusCode = code;
    return this;
  }

  json(data: any) {
    this.primitiveResponseInstance.setHeader(
      'Content-Type',
      'application/json',
    );
    this.end(JSON.stringify(data));
  }

  send(data: any) {
    this.end(data);
  }

  setHeader(key: string, value: string) {
    this.primitiveResponseInstance.setHeader(key, value);
  }

  writeHead(statusCode: number) {
    this.primitiveResponseInstance.writeHead(statusCode);
  }
}
