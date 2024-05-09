export class HttpError extends Error {
  statusCode: number;
  message: string;
  errors: any;

  constructor(statusCode: number, message: string, errors?: any) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
  }

  toJSON() {
    return {
      statusCode: this.statusCode,
      message: this.message,
      errors: this.errors,
    };
  }

  static badRequest(message: string, errors: any = null) {
    return new HttpError(400, message, errors);
  }

  static unauthorized(message: string, errors: any = null) {
    return new HttpError(401, message, errors);
  }

  static forbidden(message: string, errors: any = null) {
    return new HttpError(403, message, errors);
  }

  static notFound(message: string, errors: any = null) {
    return new HttpError(404, message, errors);
  }

  static internalServerError(message: string, errors: any = null) {
    return new HttpError(500, message, errors);
  }

  static fromError(error: Error) {
    return new HttpError(500, error.message, error.stack);
  }

  static fromValidationError(errors: any) {
    return new HttpError(400, 'Validation error', errors);
  }
}
