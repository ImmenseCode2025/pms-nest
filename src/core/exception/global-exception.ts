import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { ErrorLogs } from '../orm/entities/error-logs.entity';

@Catch()
export class GlobalException implements ExceptionFilter {
  async catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    let request: any = ctx.getRequest();
    let exceptionResponse = exception?.response;
    let statusCodeException = exceptionResponse?.statusCode
      ? exceptionResponse.statusCode
      : HttpStatus.BAD_REQUEST;

    let errorMessage: string = '';
    if (Array.isArray(exceptionResponse?.message)) {
      errorMessage = exceptionResponse?.message[0];
    }
    if (!Array.isArray(exceptionResponse?.message)) {
      errorMessage = 'api path is not valid';
    }

    await ErrorLogs.query().insertAndFetch({
      user_id: request?.auth?.user?.id ? request?.auth?.user?.id : null,
      method: request?.method,
      status_code: statusCodeException,
      url: request?.url,
      body: request?.body ? JSON.stringify(request.body) : null,
      error: errorMessage,
    });

    return response.status(statusCodeException).json({
      statusCode: statusCodeException,
      message: exceptionResponse?.message,
      error: exceptionResponse?.error,
    });
  }
}
