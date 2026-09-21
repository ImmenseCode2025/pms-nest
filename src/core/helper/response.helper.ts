import { HttpStatus } from '@nestjs/common';

export class ResponseHelper {
  static async success({ res, data, message }) {
    return res.status(HttpStatus.OK).json({
      data: data,
      statusCode: HttpStatus.OK,
      message: message,
    });
  }
  static async error({ res, error, req, errorCode = HttpStatus.BAD_REQUEST }) {
    return res.status(errorCode).json({
      statusCode: errorCode,
      message: [error.message, `error in ${req.originalUrl}`],
      error: error.response,
    });
  }
}
