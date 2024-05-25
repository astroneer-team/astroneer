import { Response } from '../../response';

export class HttpError extends Error {
  statusCode: number;
  message: string;
  data: unknown;

  constructor(statusCode: number, message: string, data?: unknown) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }

  static badRequest(message: string, data?: unknown) {
    return new HttpError(400, message, data);
  }

  static unauthorized(message: string, data?: unknown) {
    return new HttpError(401, message, data);
  }

  static forbidden(message: string, data?: unknown) {
    return new HttpError(403, message, data);
  }

  static notFound(message: string, data?: unknown) {
    return new HttpError(404, message, data);
  }

  static internalServerError(message: string, data?: unknown) {
    return new HttpError(500, message, data);
  }

  static fromError(error: Error) {
    return new HttpError(
      (error as unknown as HttpError)?.statusCode ?? 500,
      error.message,
    );
  }

  build(res: Response) {
    res.status(this.statusCode).json({
      message: this.message,
      data: this.data,
    });
  }
}
