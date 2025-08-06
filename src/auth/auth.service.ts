import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Database, InjectDatabase, withColumns } from 'src/database/utils';
import { SignInDto } from './dto/auth.dto';
import { DBSchema } from 'src/database/schemas';
import { eq } from 'drizzle-orm';
import { JwtService } from '@nestjs/jwt';
import * as ms from 'ms';
import { env } from 'env.config';
import { UserRolesService } from 'src/users/users-roles.service';

@Injectable()
export class AuthService {
  logger = new Logger(AuthService.name);
  constructor(
    @InjectDatabase private readonly db: Database,
    private readonly userRolesService: UserRolesService,
    private readonly jwtService: JwtService,
  ) {}

  async hashPassword(
    password: string,
    saltRounds: number = 10,
  ): Promise<string> {
    return await bcrypt.hash(password, await bcrypt.genSalt(saltRounds));
  }

  async comparePassword(
    password: string,
    hashPassword: string | null,
  ): Promise<boolean> {
    if (!hashPassword) return false;
    return await bcrypt.compare(password, hashPassword);
  }

  async validateUser({ email, password }: SignInDto) {
    const [user] = await this.db
      .select(
        withColumns(DBSchema.user, [
          'id',
          'email',
          'emailVerified',
          'firstname',
          'lastname',
          'createdAt',
          'country',
          'passwordHash',
          'imageUrl',
        ]),
      )
      .from(DBSchema.user)
      .where(eq(DBSchema.user.email, email));
    if (!user) {
      this.logger.debug(
        `User(${email}) authentication failed. [ERR_CODE-1140]`,
      );
      return null;
    }
    const { passwordHash, ...userData } = user;
    const isValidPassword = await this.comparePassword(password, passwordHash);
    if (!isValidPassword) {
      this.logger.debug(
        `User(${email}) authentication failed. [ERR_CODE-1141]`,
      );
      return null;
    }
    return {
      user: userData,
      roles: await this.userRolesService.getRolesByUserId(user.id),
    };
  }

  async generateSignedToken({ userId }: { userId: string }) {
    const tokenPayload = { sub: userId };
    const accessToken = await this.jwtService.signAsync(tokenPayload);
    const lifetime = ms(env.JWT_EXPIRY as ms.StringValue);
    const expires = new Date(Date.now() + lifetime);
    return {
      token: accessToken,
      refresh: null,
      expires,
      expiresTimestamp: expires.getTime(),
    };
  }
}
