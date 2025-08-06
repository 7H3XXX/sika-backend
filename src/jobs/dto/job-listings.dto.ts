import { ApiProperty, PickType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { PaginatedDto } from 'src/common/utils/paginated.utils';
import { jobListingExperienceLevel, jobListingType } from '../entities/schema';
import * as ms from 'ms';

export class PublicJobListingFilterDto extends PaginatedDto {
  @IsArray()
  @IsUUID('4', { each: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }: { value: string | string[] }) => {
    const values = typeof value === 'string' ? [value] : value;
    return values;
  })
  categoryIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }: { value: string | string[] }) => {
    const values = typeof value === 'string' ? [value] : value;
    return values;
  })
  types?: jobListingType[];

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }: { value: string | string[] }) => {
    const values = typeof value === 'string' ? [value] : value;
    return values;
  })
  experienceLevels?: jobListingExperienceLevel[];

  @IsArray()
  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }: { value: ms.StringValue }) => {
    const transform = (val: ms.StringValue) => new Date(Date.now() - ms(val));
    const values = typeof value === 'string' ? [value] : value;
    const result = values
      .filter((value) => ms(value))
      .map((value) => transform(value));
    return result;
  })
  dateRanges?: Date[];

  @IsString()
  @ApiProperty({ required: false })
  @IsOptional()
  location?: string;

  @IsString()
  @ApiProperty({ required: false })
  @IsOptional()
  search?: string;

  @IsNumber()
  @ApiProperty({ required: false })
  @IsOptional()
  salaryFrom?: number;

  @IsNumber()
  @ApiProperty({ required: false })
  @IsOptional()
  salaryTo?: number;

  @IsUUID()
  @ApiProperty({ required: false })
  @IsOptional()
  organisationId?: string;

  @IsUUID()
  @ApiProperty({ required: false })
  @IsOptional()
  createdById?: string;
}

export class JobListingFilterDto extends PickType(PublicJobListingFilterDto, [
  'currPage',
  'perPage',
  'organisationId',
]) {
  @IsBoolean()
  @IsOptional()
  @ApiProperty({ required: false })
  isActive?: boolean;
}
