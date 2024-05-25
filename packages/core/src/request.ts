import { IncomingMessage } from 'http';
import { HttpError } from './errors';
import { UnprocessableError } from './errors/application/unprocessable-error';

/**
 * Represents an HTTP request.
 */
/**
 * Represents an HTTP request.
 */
export class Request {
  /**
   * The primitive request instance.
   */
  private map: Map<string | symbol, string> = new Map();
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
    return new Promise((resolve) => {
      let data = '';
      this.primitiveRequestInstance.on('data', (chunk) => {
        data += chunk;
      });
      this.primitiveRequestInstance.on('end', () => {
        resolve(data ? JSON.parse(data) : undefined);
      });
    });
  }

  /**
   * Appends data to the request.
   * @param key - The key to append the data to.
   * @param data - The data to append.
   */
  append(key: string | symbol, data: unknown): void {
    this.map.set(key, JSON.stringify(data));
  }

  /**
   * Checks if the request has a specific key.
   * @param key - The key to check.
   * @returns `true` if the request has the key, `false` otherwise.
   */
  has(key: string | symbol): boolean {
    return this.map.has(key);
  }

  /**
   * Gets the value associated with a specific key.
   * @param key - The key to get the value for.
   * @returns The value associated with the key.
   * @throws `HttpError` if the key does not exist.
   */
  get<T>(key: string | symbol): T {
    const data = this.map.get(key);

    if (!data) {
      throw new UnprocessableError('Key does not exist');
    }

    return JSON.parse(data);
  }
}
