// src/users/dto/user-response.dto.ts

import { UserRole } from '../roles.enum';

export class UserResponseDto {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}
