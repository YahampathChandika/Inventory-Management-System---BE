import {
  IsOptional,
  IsString,
  IsNumber,
  IsIn,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class EmailQueryDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  @IsIn(['sent', 'failed', 'pending'])
  status?: string;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
