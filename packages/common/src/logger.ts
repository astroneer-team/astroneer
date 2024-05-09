import picocolors from 'picocolors';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';
export enum LevelColors {
  info = 'green',
  warn = 'yellow',
  error = 'red',
  debug = 'magenta',
}

export class Logger {
  private static staticInstanceRef = new Logger();

  log(message: string) {
    this.logMessage('info', message);
  }

  error(message: string) {
    this.logMessage('error', message);
  }

  warn(message: string) {
    this.logMessage('warn', message);
  }

  debug(message: string) {
    this.logMessage('debug', message);
  }

  static log(message: string) {
    Logger.staticInstanceRef.log(message);
  }

  static error(message: string) {
    Logger.staticInstanceRef.error(message);
  }

  static warn(message: string) {
    Logger.staticInstanceRef.warn(message);
  }

  static debug(message: string) {
    Logger.staticInstanceRef.debug(message);
  }

  private logMessage(level: LogLevel, message: string) {
    console.log(
      picocolors.gray(level.toUpperCase()),
      picocolors[LevelColors[level]](message),
    );
  }
}
