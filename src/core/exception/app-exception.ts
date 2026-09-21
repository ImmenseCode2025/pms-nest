import {
    HttpException,
    HttpStatus,
    BadRequestException,
    UnauthorizedException,
    ForbiddenException,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';

export class AppException {
    static badRequest({ message }) {
        throw new BadRequestException(message);
    }

    static unauthorized({ message }) {
        throw new UnauthorizedException(message);
    }

    static forbidden({ message }) {
        throw new ForbiddenException(message);
    }

    static notFound({ message }) {
        throw new NotFoundException(message);
    }

    static conflict({ message }) {
        throw new ConflictException(message);
    }

    static internal({ message }) {
        throw new HttpException(
            message,
            HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
}
