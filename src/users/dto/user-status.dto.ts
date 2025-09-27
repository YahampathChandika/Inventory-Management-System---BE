import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UserStatusDto {
  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;
}
