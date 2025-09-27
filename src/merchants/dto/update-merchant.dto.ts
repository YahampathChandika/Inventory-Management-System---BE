import {
  IsOptional,
  IsString,
  IsEmail,
  IsBoolean,
  MaxLength,
} from 'class-validator';

export class UpdateMerchantDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
