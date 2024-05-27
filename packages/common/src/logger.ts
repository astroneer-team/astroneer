import picocolors from 'picocolors';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';
export enum LevelColors {
  info = 'blue',
  warn = 'yellow',
  error = 'red',
  debug = 'magenta',
}

/**
 * Represents a Logger class that provides logging functionality.
 */
export class Logger {
  private static staticInstanceRef = new Logger();

  /**
   * Logs an informational message.
   * @param message - The message to be logged.
   */
  log(message?: string) {
    this.logMessage('info', message);
  }

  /**
   * Logs an error message.
   * @param message - The message to be logged.
   */
  error(message?: string, stack?: string) {
    this.logMessage('error', message);
    if (stack) {
      console.log(picocolors.gray(stack));
    }
  }

  /**
   * Logs a warning message.
   * @param message - The message to be logged.
   */
  warn(message?: string) {
    this.logMessage('warn', message);
  }

  /**
   * Logs a debug message.
   * @param message - The message to be logged.
   */
  debug(message?: string) {
    this.logMessage('debug', message);
  }

  /**
   * Logs an informational message using the static instance of the Logger class.
   * @param message - The message to be logged.
   */
  static log(message?: string) {
    Logger.staticInstanceRef.log(message);
  }

  /**
   * Logs an error message using the static instance of the Logger class.
   * @param message - The message to be logged.
   */
  static error(message?: string, stack?: string) {
    Logger.staticInstanceRef.error(message, stack);
  }

  /**
   * Logs a warning message using the static instance of the Logger class.
   * @param message - The message to be logged.
   */
  static warn(message?: string) {
    Logger.staticInstanceRef.warn(message);
  }

  /**
   * Logs a debug message using the static instance of the Logger class.
   * @param message - The message to be logged.
   */
  static debug(message?: string) {
    Logger.staticInstanceRef.debug(message);
  }

  private logMessage(level: LogLevel, message?: string) {
    console.log(
      picocolors.gray(level.toUpperCase()),
      picocolors[LevelColors[level]](message),
    );
  }
}
