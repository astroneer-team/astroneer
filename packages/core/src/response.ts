import { IncomingMessage, ServerResponse } from 'http';

export class ProtonResponse {
  /**
   * The primitive response instance.
   */
  private readonly primitiveResponseInstance: ServerResponse<IncomingMessage>;

  constructor(res: ServerResponse<IncomingMessage>) {
    this.primitiveResponseInstance = res;
  }

  /**
   * Ends the response.
   * @param data The data to end the response with.
   */
  end(data: string) {
    this.primitiveResponseInstance.end(data);
  }

  /**
   * Sets the status code of the response.
   * @param code The status code to set.
   * @returns The response instance.
   */
  status(code: number) {
    this.primitiveResponseInstance.statusCode = code;
    return this;
  }

  /**
   * Sends a JSON response.
   * @param data The data to send.
   */
  json(data: any) {
    this.primitiveResponseInstance.setHeader(
      'Content-Type',
      'application/json',
    );
    this.end(JSON.stringify(data));
  }

  /**
   * Sends a response.
   * @param data The data to send.
   */
  send(data: any) {
    this.end(data);
  }

  /**
   * Sets a header.
   * @param key The key of the header.
   * @param value The value of the header.
   */
  setHeader(key: string, value: string) {
    this.primitiveResponseInstance.setHeader(key, value);
  }

  /**
   * Writes a head.
   * @param statusCode The status code of the head.
   */
  writeHead(statusCode: number) {
    this.primitiveResponseInstance.writeHead(statusCode);
  }
}
