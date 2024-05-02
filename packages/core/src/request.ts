import { IncomingMessage } from 'http';

export class AstroneerRequest {
  /**
   * The primitive request instance.
   */
  private primitiveRequestInstance: IncomingMessage;

  constructor(
    req: IncomingMessage,
    /**
     * The parameters of the request.
     */
    readonly params: { [key: string]: string } = {},
    /**
     * The query of the request.
     */
    readonly query: { [key: string]: string } = {},
  ) {
    this.primitiveRequestInstance = req;
  }

  /**
   * The socket of the request.
   */
  get socket() {
    return this.primitiveRequestInstance.socket;
  }

  /**
   * The headers of the request.
   */
  get headers() {
    return this.primitiveRequestInstance.headers;
  }

  /**
   * The method of the request.
   */
  get method() {
    return this.primitiveRequestInstance.method;
  }

  /**
   * The url of the request.
   */
  get url() {
    return this.primitiveRequestInstance.url;
  }

  /**
   * The status code of the request.
   */
  get statusCode() {
    return this.primitiveRequestInstance.statusCode;
  }

  /**
   * The status message of the request.
   * @returns The status message of the request.
   */
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
