import {
  IsOptional,
  IsString,
  IsNumber,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateInventoryDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Quantity must be greater than or equal to 0' })
  @Transform(({ value }) => parseInt(value))
  quantity?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'Unit price must be greater than or equal to 0' })
  @Transform(({ value }) => parseFloat(value))
  unitPrice?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  sku?: string;
}
