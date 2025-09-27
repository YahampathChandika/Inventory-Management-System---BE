import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  MaxLength,
  Min,
  IsDecimal,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateInventoryDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0, { message: 'Quantity must be greater than or equal to 0' })
  @Transform(({ value }) => parseInt(value))
  quantity: number;

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
