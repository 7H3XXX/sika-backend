import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class QuerySearch {
  @IsString()
  @ApiProperty({ required: false })
  @IsOptional()
  search?: string;
}
