import picocolors from 'picocolors';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';
export enum LevelColors {
  info = 'green',
  warn = 'yellow',
  error = 'red',
  debug = 'gray',
}

export class Logger {
  private static staticInstanceRef = new Logger();
  private context?: string;

  constructor(context?: string) {
    this.context = context;
  }

  log(message: string, context?: string) {
    this.logMessage('info', message, context || this.context);
  }

  error(message: string, context?: string) {
    this.logMessage('error', message, context || this.context);
  }

  warn(message: string, context?: string) {
    this.logMessage('warn', message, context || this.context);
  }

  debug(message: string, context?: string) {
    this.logMessage('debug', message, context || this.context);
  }

  static log(message: string, context?: string) {
    Logger.staticInstanceRef.log(message, context);
  }

  static error(message: string, context?: string) {
    Logger.staticInstanceRef.error(message, context);
  }

  static warn(message: string, context?: string) {
    Logger.staticInstanceRef.warn(message, context);
  }

  static debug(message: string, context?: string) {
    Logger.staticInstanceRef.debug(message, context);
  }

  private logMessage(level: LogLevel, message: string, context?: string) {
    const contextString = context ? `[${context}]` : '';

    console.log(
      picocolors[LevelColors[level]](level.toUpperCase()),
      picocolors.yellow(contextString),
      picocolors[LevelColors[level]](message),
    );
  }
}
