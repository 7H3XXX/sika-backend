import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { Request } from 'express';
import { UsersService } from 'src/users/users.service';
import { AuthRole, AuthUser } from '../auth.interface';
import { ApiErrorCodes } from 'types/error.codes';
import { UserRolesService } from 'src/users/users-roles.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRolesService: UserRolesService,
    private readonly userService: UsersService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request & { user?: AuthUser; roles?: AuthRole[] } = context
      .switchToHttp()
      .getRequest();
    const authorization = request.headers.authorization; //? 'Bearer <token>'
    const token = authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException({
        message: 'Authorization token not found in request headers.',
        errorCode: ApiErrorCodes.MISSING_TOKEN,
      });
    }
    try {
      // Retrieve user data and roles
      const { sub }: { sub: string } = await this.jwtService.verifyAsync(token);
      const user = await this.userService.findById(sub);
      const roles = await this.userRolesService.getRolesByUserId(sub);
      if (!user) {
        throw new UnauthorizedException({
          message:
            'Authenticated user not found. Please ensure your account exists and try again.',
          errorCode: ApiErrorCodes.USER_NOT_FOUND,
        });
      }
      request.user = user as AuthUser;
      request.roles = (roles || []) as AuthRole[];
      return true;
    } catch (error: unknown) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException({
          message: 'JWT token has expired. Please log in again.',
          errorCode: ApiErrorCodes.TOKEN_EXPIRED,
        });
      }
      throw new UnauthorizedException({
        message: 'Invalid or malformed JWT token.',
        errorCode: ApiErrorCodes.INVALID_TOKEN,
      });
    }
  }
}
