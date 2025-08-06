// src/auth/guards/roles.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Type,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { Request } from 'express';
import { AuthRole, AuthUser } from '../auth.interface';
import { ApiErrorCodes } from 'types/error.codes';
import { UserRolesService } from 'src/users/users-roles.service';

export interface RolesGuardOptions {
  allow?: AuthRole['role'][];
  deny?: AuthRole['role'][];
}

export function RolesGuard(
  options: RolesGuardOptions = {
    allow: ['admin', 'employer', 'seeker', 'user'],
    deny: [],
  },
): Type<CanActivate> {
  @Injectable()
  class MixinRolesGuard extends AuthGuard {
    constructor(
      private readonly reflector: Reflector,
      jwtService: JwtService,
      userService: UsersService,
      userRolesService: UserRolesService,
    ) {
      super(jwtService, userRolesService, userService);
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const isAuthenticated = await super.canActivate(context);
      if (!isAuthenticated) return false;

      const request: Request & { user?: AuthUser; roles?: AuthRole[] } = context
        .switchToHttp()
        .getRequest();

      const user = request.user;
      const roles = request.roles ?? [];
      if (!user) return false;

      const isAuthorized = roles?.some(
        (role) =>
          options.allow?.includes(role.role) &&
          !options.deny?.includes(role.role),
      );

      if (!isAuthorized) {
        throw new ForbiddenException({
          message: `Access denied: your role does not have permission to perform this action. Required roles: [${options.allow?.join(', ') || null}], denied roles: [${options.deny?.join(', ') || null}].`,
          errorCode: ApiErrorCodes.PERMISSION_DENIED,
        });
      }

      return isAuthorized;
    }
  }

  return MixinRolesGuard;
}
