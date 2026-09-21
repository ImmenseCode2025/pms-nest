import { Injectable, LoggerService } from '@nestjs/common';
import { createLogger, format, transports } from 'winston';
import { RequestContextService } from '../middleware/request-context.service';

@Injectable()
export class CustomLoggerService implements LoggerService {
  private readonly logger = createLogger({
    level: 'info',
    format: format.combine(
      format.colorize(),
      format.timestamp(),
      format.printf(({ timestamp, level, message }) => {
        return `${timestamp} ${level}: ${message}`;
      }),
    ),
    transports: [
      new transports.Console(),
      // Add more transports like file or HTTP if necessary
    ],
  });

  // Static logger instance to be used in static methods
  private static staticLogger = createLogger({
    level: 'info',
    format: format.combine(
      format.colorize(),
      format.timestamp(),
      format.printf(({ timestamp, level, message }) => {
        return `${timestamp} ${level}: ${message}`;
      }),
    ),
    transports: [
      new transports.Console(),
      // Add more transports like file or HTTP if necessary
    ],
  });

  constructor(private readonly context: RequestContextService) {}

  static async getCallerDetailsStatic(): Promise<string> {
    const stack = new Error().stack;
    if (!stack) return '';
    const stackLines = stack.split('\n');
    const callerLine = stackLines[3]; // actual caller
    const match = callerLine.match(/at\s+(.*)\s+\((.*):(\d+):(\d+)\)/);
    if (match) {
      const [, functionName, filePath, line, column] = match;
      return `function:${functionName}() | full_path:${filePath}`;
    }
    // Fallback for anonymous or different format
    return callerLine.replace(/\s+at\s+/, '').trim();
  }

  private async getCallerDetails(): Promise<any> {
    const stack = new Error().stack;
    if (!stack) return '';
    const stackLines = stack.split('\n');
    const callerLine = stackLines[3]; // actual caller
    const match = callerLine.match(/at\s+(.*)\s+\((.*):(\d+):(\d+)\)/);
    if (match) {
      const [, functionName, filePath, line, column] = match;
      return { functionName: `${functionName}()` };
    }
    // Fallback for anonymous or different format
    return callerLine.replace(/\s+at\s+/, '').trim();
  }

  async log(message: string) {
    const { functionName } = await this.getCallerDetails();
    const req: any = this.context.getRequest();
    this.logger.info(`url:${req.url}`);
    this.logger.info(`functionName:${functionName}`);
  }

  static async errorStatic({ userId, method, url, message, body }: any) {
    const location = await this.getCallerDetailsStatic();
    const errorMsg = `message:${message} | location:${location}`;
    CustomLoggerService.staticLogger.error(`url:${url} | ${errorMsg}`);
  }

  async error(message: any) {
    const location = await this.getCallerDetails();
    const req: any = this.context.getRequest();
    const errorMsg = `message:${message} | location:${location}`;
    this.logger.error(`url:${req.url} | ${errorMsg}`);
  }

  async warn(message: string) {
    const location = await this.getCallerDetails();
    const req: any = this.context.getRequest();
    this.logger.warn(
      `url:${req.url} | message:${message} | location:${location}`,
    );
  }

  async debug(message: string) {
    const location = await this.getCallerDetails();
    const req: any = this.context.getRequest();
    this.logger.debug(
      `url:${req.url} | message:${message} | location:${location}`,
    );
  }

  async verbose(message: string) {
    const location = await this.getCallerDetails();
    const req: any = this.context.getRequest();
    this.logger.verbose(
      `url:${req.url} | message:${message} | location:${location}`,
    );
  }
}
