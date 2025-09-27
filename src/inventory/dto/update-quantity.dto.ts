import { IsNotEmpty, IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateQuantityDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0, { message: 'Quantity must be greater than or equal to 0' })
  @Transform(({ value }) => parseInt(value))
  quantity: number;
}
