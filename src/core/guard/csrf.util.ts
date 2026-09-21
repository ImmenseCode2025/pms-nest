import { HttpException, HttpStatus } from '@nestjs/common';
import { doubleCsrf } from 'csrf-csrf';
const { doubleCsrfProtection, generateCsrfToken } = doubleCsrf({
  getSecret: (req) => {
    if (!req.session?.id) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: [`Session Expired Please login in again`],
          error: 'Session Expired Please login in again',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return req.session.id;
  },
  getSessionIdentifier: (req) => req.session.id,
  getCsrfTokenFromRequest: (req) => req.headers['x-csrf-token'] as string,
  cookieName: 'XSRF-TOKEN',
  cookieOptions: {
    httpOnly: false,
    sameSite: 'lax',
    secure: false,
  },
});

export { doubleCsrfProtection, generateCsrfToken };
