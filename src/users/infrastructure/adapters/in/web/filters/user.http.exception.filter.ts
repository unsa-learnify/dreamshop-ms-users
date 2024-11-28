import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { UserDuplicatedException } from 'src/users/domain/exceptions/user.duplicated.exception';
import { UserNotFoundException } from 'src/users/domain/exceptions/user.not.found.exception';
import { RoleNotFoundException } from 'src/users/domain/exceptions/role.not.found.exception';
import { RoleDuplicatedException } from 'src/users/domain/exceptions/role.duplicated.exception';
import { KeycloakConnectionException } from '../../../out/persistence/exceptions/keycloak.connection.exception';

@Catch(
  UserNotFoundException,
  UserDuplicatedException,
  RoleNotFoundException,
  RoleDuplicatedException,
  KeycloakConnectionException,
)
export class UserHttpExceptionFilter implements ExceptionFilter {
  private readonly exceptionToStatusMap = new Map<Function, number>([
    [UserNotFoundException, HttpStatus.NOT_FOUND],
    [UserDuplicatedException, HttpStatus.CONFLICT],
    [RoleNotFoundException, HttpStatus.NOT_FOUND],
    [RoleDuplicatedException, HttpStatus.CONFLICT],
    [KeycloakConnectionException, HttpStatus.FAILED_DEPENDENCY],
  ]);
  catch(exception: any, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const status =
      this.exceptionToStatusMap.get(exception.constructor) ||
      HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception.message || 'Internal server error';
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
    };
    response.status(status).json(errorResponse);
  }
}
