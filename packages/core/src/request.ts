import { IncomingMessage } from 'http';

export class Request {
  private map: Map<string | symbol, string> = new Map();
  private serverRequest: IncomingMessage;

  constructor(
    req: IncomingMessage,
    readonly params: { [key: string]: string } = {},
    readonly query: { [key: string]: string } = {},
  ) {
    this.serverRequest = req;
  }

  get socket() {
    return this.serverRequest.socket;
  }

  get headers() {
    return this.serverRequest.headers;
  }

  get method() {
    return this.serverRequest.method;
  }

  get url() {
    return this.serverRequest.url;
  }

  get statusCode() {
    return this.serverRequest.statusCode;
  }

  async body<T = unknown>(): Promise<T> {
    return new Promise((resolve) => {
      let data = '';
      this.serverRequest.on('data', (chunk) => {
        data += chunk;
      });
      this.serverRequest.on('end', () => {
        resolve(data ? JSON.parse(data) : undefined);
      });
    });
  }

  append(key: string | symbol, data: unknown): void {
    this.map.set(key, JSON.stringify(data));
  }

  has(key: string | symbol): boolean {
    return this.map.has(key);
  }

  get<T>(key: string | symbol): T | null {
    const data = this.map.get(key);

    if (!data) {
      return null;
    }

    return JSON.parse(data);
  }
}
