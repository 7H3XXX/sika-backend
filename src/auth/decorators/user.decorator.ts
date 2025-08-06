import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthUser } from '../auth.interface';
import { ApiErrorCodes } from 'types/error.codes';

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: Request & { user?: AuthUser } = ctx
      .switchToHttp()
      .getRequest();
    const { user } = request;
    if (!user) {
      throw new BadRequestException({
        message:
          'User not found in request. Authentication required. [ERR_CODE-2111]',
        errorCode: ApiErrorCodes.AUTHENTICATION_REQUIRED,
      });
    }
    return user;
  },
);
