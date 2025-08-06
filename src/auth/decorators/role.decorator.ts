import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthRole } from '../auth.interface';
import { ApiErrorCodes } from 'types/error.codes';

export const GetRoles = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: Request & { roles?: AuthRole[] } = ctx
      .switchToHttp()
      .getRequest();
    const { roles } = request;
    if (!roles) {
      throw new BadRequestException({
        message:
          'Missing user roles in request. Authentication required. [ERR_CODE-2112]',
        errorCode: ApiErrorCodes.AUTHENTICATION_REQUIRED,
      });
    }
    return roles;
  },
);
