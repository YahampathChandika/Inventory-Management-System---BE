import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';

export class BulkImportDto {
  @IsNotEmpty()
  @IsString()
  emails: string; // Comma or newline separated emails

  @IsOptional()
  @IsString()
  @MaxLength(255)
  defaultName?: string;
}
