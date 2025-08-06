import { ApiProperty } from '@nestjs/swagger';
import { IsDataURI, IsEmail, IsString } from 'class-validator';

export class SignInDto {
  @IsEmail()
  @ApiProperty({ example: 'johndoe@mail.com' })
  email: string;

  @IsString()
  @ApiProperty({ example: '10xDev' })
  password: string;
}

export class ProfileImageDto {
  @IsDataURI()
  @ApiProperty({
    example: 'data:image/png;base64,iVBORw0KGgoAAAAN',
  })
  image: string;
}
