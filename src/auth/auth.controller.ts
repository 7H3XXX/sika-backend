import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from 'src/users/dto/user.dto';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { ProfileImageDto, SignInDto } from './dto/auth.dto';
import { GetUser } from './decorators/user.decorator';
import { AuthUser } from './auth.interface';
import { AuthGuard } from './guards/auth.guard';
import { ApiErrorCodes } from 'types/error.codes';

@Controller('auth')
@ApiTags('authentication')
export class AuthController {
  constructor(
    private readonly userService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('sign-up')
  @ApiOperation({ summary: 'Creates new user from request body' })
  async postAuthSignUp(@Body() { password, ...data }: CreateUserDto) {
    const passwordHash = await this.authService.hashPassword(password);
    const user = await this.userService.create({
      passwordHash,
      ...data,
    });
    return {
      status: true,
      message: 'Sign up successful.',
      data: user,
    };
  }

  @Post('sign-in')
  @ApiOperation({ summary: 'Sign in user using email and password' })
  async postAuthSignIn(@Body() { email, password }: SignInDto) {
    const authData = await this.authService.validateUser({ email, password });
    if (!authData) {
      throw new UnauthorizedException({
        message: 'User authentication failed. Invalid username or password',
        errorCode: ApiErrorCodes.INVALID_CREDENTIALS,
      });
    }
    const access = await this.authService.generateSignedToken({
      userId: authData.user.id,
    });
    return {
      status: true,
      message: 'Sign in successful',
      data: {
        ...authData,
        access,
      },
    };
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Returns profile data of the logged in user' })
  getAuthProfile(@GetUser() authUser: AuthUser) {
    return {
      status: true,
      message: 'User auth profile retrieved successfully',
      data: authUser,
    };
  }

  @Put('profile/image')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Updates profile image of the logged in user' })
  putAuthProfileImage(
    @GetUser() authUser: AuthUser,
    @Body() { image }: ProfileImageDto,
  ) {
    return {
      status: true,
      message: 'Profile image updated successfully',
      data: this.userService.updateProfileImageByUserId(authUser.id, image),
    };
  }
}
