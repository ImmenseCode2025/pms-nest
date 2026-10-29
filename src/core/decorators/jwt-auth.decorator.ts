import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  UseGuards,
} from '@nestjs/common';
import { EmployeeJwtAuthGuard } from '../guard/employee-jwt-auth.guard';
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
 * Composite decorator that bypasses legacy JwtAuthGuard
 * and enforces EmployeeJwtAuthGuard for employees.
 * Usage:
 *   @EmployeeAuth()
 *   @Get('employee-profile')
 *   getProfile(@EmployeeAuthId() employeeId: number) { ... }
 */
export function EmployeeAuth() {
  return applyDecorators(Public(), UseGuards(EmployeeJwtAuthGuard));
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
    return request.user?.id || 0;
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

/**
 * Extracts the employee ID from request.employee
 */
export const EmployeeAuthId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): number | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.employee?.id || 0;
  },
);

/**
 * Extracts the employee payload (or a specific key) from request.employee
 * Usage:
 *   @CurrentEmployee() employee: any
 *   @CurrentEmployee('site') site: number
 */
export const CurrentEmployee = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const employee = request.employee;
    return data ? employee?.[data] : employee;
  },
);
