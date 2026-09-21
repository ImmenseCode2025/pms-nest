import { HttpStatus } from '@nestjs/common';
import { ErrorLogs } from '../orm/entities/error-logs.entity';

export class ResponseHelper {
  static async success({ res, data, message }) {
    return res.status(HttpStatus.OK).json({
      data: data,
      statusCode: HttpStatus.OK,
      message: message,
    });
  }
  static async error({ res, error, req, errorCode = HttpStatus.BAD_REQUEST }) {
    await ErrorLogs.query().insertAndFetch({
      user_id: req?.auth?.user?.id ? req?.auth?.user?.id : null,
      method: req?.method,
      status_code: errorCode,
      url: req?.url,
      body: req?.body ? JSON.stringify(req.body) : null,
      error: error?.message,
    });
    return res.status(errorCode).json({
      statusCode: errorCode,
      message: [error.message, `error in ${req.originalUrl}`],
      error: error.response,
    });
  }
}
