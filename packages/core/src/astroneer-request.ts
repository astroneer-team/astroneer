import { IncomingMessage } from 'http';

export class AstroneerRequest {
  private primitiveRequestInstance: IncomingMessage;

  constructor(req: IncomingMessage) {
    this.primitiveRequestInstance = req;
  }

  get socket() {
    return this.primitiveRequestInstance.socket;
  }

  get headers() {
    return this.primitiveRequestInstance.headers;
  }

  get method() {
    return this.primitiveRequestInstance.method;
  }

  get url() {
    return this.primitiveRequestInstance.url;
  }

  get statusCode() {
    return this.primitiveRequestInstance.statusCode;
  }

  async body<T = unknown>(): Promise<T> {
    return new Promise((resolve, reject) => {
      let data = '';
      this.primitiveRequestInstance.on('data', (chunk) => {
        data += chunk;
      });
      this.primitiveRequestInstance.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(err);
        }
      });
    });
  }
}
