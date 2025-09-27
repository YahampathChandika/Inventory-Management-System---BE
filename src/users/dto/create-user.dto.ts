import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  MinLength,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/, {
    message:
      'Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number',
  })
  password: string;

  @IsNotEmpty()
  @IsNumber()
  roleId: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}
