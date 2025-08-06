import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { SchemaDto } from 'src/database/dto/schema.dto';

export class UserDto extends SchemaDto {
  @IsEmail()
  @ApiProperty({ example: 'johndoe@mail.com' })
  email: string;

  @IsString()
  @ApiProperty({ example: 'John' })
  firstname: string;

  @IsString()
  @ApiProperty({ example: 'Doe' })
  lastname: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'Ghana' })
  country: string;
}

enum UserType {
  employer = 'employer',
  seeker = 'seeker',
}

export class CreateUserDto extends OmitType(UserDto, [
  'id',
  'createdAt',
  'updatedAt',
]) {
  @IsString()
  @ApiProperty({ example: '10xDev' })
  password: string;

  @IsEnum(UserType)
  @ApiProperty({ example: UserType.seeker, enum: UserType })
  userType: UserType;
}

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password']),
  {
    skipNullProperties: true,
  },
) {}
