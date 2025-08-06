import { BadRequestException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsString } from 'class-validator';

export class SchemaDto {
  @IsString()
  @ApiProperty({ example: '567f039c-6d06-4c4b-bf6c-372c78dbd74c' })
  id: string;

  @IsDate()
  @ApiProperty({
    example: '2023-03-15T12:00:00Z',
    description: 'ISO 8601 formatted date string',
  })
  @Transform(({ value, key }: { value: string; key: string }) => {
    const date = new Date(value);
    if (!date.getTime())
      throw new BadRequestException(
        `${key} must be a valid ISO 8601 date string`,
      );
    return date;
  })
  createdAt: Date;

  @IsDate()
  @ApiProperty({
    example: '2023-03-15T12:00:00Z',
    description: 'ISO 8601 formatted date string',
  })
  @Transform(({ value, key }: { value: string; key: string }) => {
    const date = new Date(value);
    if (!date.getTime())
      throw new BadRequestException(
        `${key} must be a valid ISO 8601 date string`,
      );
    return date;
  })
  updatedAt: Date;
}
