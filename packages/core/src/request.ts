import { IncomingMessage } from 'http';

/**
 * Represents an HTTP request.
 */
export class Request {
  /**
   * The primitive request instance.
   */
  private primitiveRequestInstance: IncomingMessage;

  /**
   * Creates a new Request instance.
   * @param req - The incoming message object representing the request.
   * @param params - The parameters of the request.
   * @param query - The query parameters of the request.
   */
  constructor(
    req: IncomingMessage,
    readonly params: { [key: string]: string } = {},
    readonly query: { [key: string]: string } = {},
  ) {
    this.primitiveRequestInstance = req;
  }

  /**
   * Gets the socket associated with the request.
   * @returns The socket associated with the request.
   */
  get socket() {
    return this.primitiveRequestInstance.socket;
  }

  /**
   * Gets the headers of the request.
   * @returns The headers of the request.
   */
  get headers() {
    return this.primitiveRequestInstance.headers;
  }

  /**
   * Gets the HTTP method of the request.
   * @returns The HTTP method of the request.
   */
  get method() {
    return this.primitiveRequestInstance.method;
  }

  /**
   * Gets the URL of the request.
   * @returns The URL of the request.
   */
  get url() {
    return this.primitiveRequestInstance.url;
  }

  /**
   * Gets the status code of the request.
   * @returns The status code of the request.
   */
  get statusCode() {
    return this.primitiveRequestInstance.statusCode;
  }

  /**
   * Gets the status message of the request.
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
