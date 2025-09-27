import { Exclude } from 'class-transformer';

export class UserResponseDto {
  id: number;
  username: string;
  email: string;

  @Exclude()
  passwordHash: string;

  role: {
    id: number;
    name: string;
    description: string;
  };

  isActive: boolean;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}
