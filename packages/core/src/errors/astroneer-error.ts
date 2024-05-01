import { AstroneerErrorCode } from '../enums/astroneer-error-code';
import { red, gray } from 'picocolors';

export class AstroneerError extends Error {
  code: AstroneerErrorCode;

  constructor(message: string, code: AstroneerErrorCode) {
    super(`❌ ${red(`[${code}]`)} ${gray(message)}`);
    this.code = code;
  }

  static fromError(error: Error, code: AstroneerErrorCode) {
    return new AstroneerError(error.message, code);
  }

  static fromMessage(message: string, code: AstroneerErrorCode) {
    return new AstroneerError(message, code);
  }
}
