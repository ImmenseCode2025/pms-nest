import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  UseGuards,
} from '@nestjs/common';
import { OperatorJwtAuthGuard } from '../guard/operator-jwt-auth.guard';
import { Public } from '../guard/public.decorator';

/**
 * Composite decorator that allows an endpoint to bypass legacy JwtAuthGuard
 * and securely enforce OperatorJwtAuthGuard for operators.
 * Usage:
 *   @OperatorAuth()
 *   @Get('operator-profile')
 *   getProfile(@OperatorAuthId() operatorId: number) { ... }
 */
export function OperatorAuth() {
  return applyDecorators(Public(), UseGuards(OperatorJwtAuthGuard));
}

/**
 * Extracts the user/operator ID from the decoded JWT token payload
 * Checks payload.id or payload.operatorId
 */
export const JwtAuthId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): number | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.id ?? request.user?.operatorId;
  },
);

/**
 * Extracts the full JWT payload or a specific key from request.user
 * Usage:
 *   @JwtUser() user: any
 *   @JwtUser('username') username: string
 */
export const JwtUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);

/**
 * Extracts the operator ID specifically from request.user
 */
export const OperatorAuthId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): number | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.operatorId ?? request.user?.id;
  },
);

/**
 * Extracts the operator payload from request.user
 */
export const CurrentOperator = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
