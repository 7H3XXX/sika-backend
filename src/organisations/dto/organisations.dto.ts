import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { IsDataURI, IsOptional, IsString, IsUUID } from 'class-validator';
import { SchemaDto } from 'src/database/dto/schema.dto';

export class OrganisationDto extends SchemaDto {
  @ApiProperty({ example: 'Google Inc.' })
  @IsString()
  name: string;

  @ApiProperty({
    example:
      'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Dolor voluptate repudiandae ducimus placeat tenetur reiciendis perspiciatis in dolores, vel eius quaerat asperiores fugiat corporis quam similique odit voluptatum accusantium itaque beatae praesentium vitae possimus? Atque, magni labore molestias ratione corporis nesciunt esse beatae sit veniam?',
  })
  @IsString()
  about: string;

  @ApiProperty({ example: 'https://www.google.com' })
  @IsString()
  website: string;

  @ApiProperty({
    example: 'data:image/png;base64,iVBORw0KGgoAAAAN',
  })
  @IsDataURI()
  imageUrl: string;

  @ApiProperty({ example: 'USA' })
  @IsString()
  country: string;

  @ApiProperty({ example: '5ce7a6f6-b700-41e6-9965-71ee4381a1cd' })
  @IsUUID()
  ownerId: string;
}

export class CreateOrganisationDto extends PickType(OrganisationDto, [
  'name',
  'about',
  'country',
  'website',
]) {
  @ApiProperty({
    example: 'data:image/png;base64,iVBORw0KGgoAAAAN',
    required: false,
  })
  @IsDataURI()
  @IsOptional()
  image?: string;
}

export class UpdateOrganisationDto extends PartialType(CreateOrganisationDto) {}

export class OrganisationFilterDto extends PartialType(
  PickType(OrganisationDto, ['ownerId', 'country']),
) {}
