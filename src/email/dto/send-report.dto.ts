import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  ArrayNotEmpty,
  MaxLength,
} from 'class-validator';

export class SendReportDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsEmail({}, { each: true })
  recipients: string[];

  @IsOptional()
  @IsString()
  @MaxLength(255)
  subject?: string;

  @IsOptional()
  @IsString()
  customMessage?: string;
}
