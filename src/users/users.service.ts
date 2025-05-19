import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword, comparePasswords } from '../utils/hash-password';

@Injectable()
export class UsersService {
  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await hashPassword(createUserDto.password);

    const [newUser] = await db
      .insert(users)
      .values({
        name: createUserDto.name,
        email: createUserDto.email,
        role: createUserDto.role,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return newUser;
  }

  async findByEmail(email: string) {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async validateUser(email: string, password: string) {
    const user = await this.findByEmail(email);
    if (!user) return null;

    const isMatch = await comparePasswords(password, user.password);
    return isMatch ? user : null;
  }
}
