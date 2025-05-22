import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';

import { db } from '../db';
import { User, users } from '../db/schema';
import { hashPassword } from '../utils/hash-password';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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

  async findByEmail(email: string): Promise<User | undefined> {
    const result = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });

    return result ?? undefined;
  }

  async findAll() {
    return await db.select().from(users);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    // Verifica se o usuário existe
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, id),
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, role, ...rest } = updateUserDto;

    const updateData: Partial<typeof users.$inferInsert> = {
      ...rest,
      updatedAt: new Date(),
    };

    if (password) {
      updateData.password = await hashPassword(password);
    }

    if (role) {
      updateData.role = role;
    }

    await db.update(users).set(updateData).where(eq(users.id, id));

    // Busca o usuário atualizado para retorno (sem senha)
    const updatedUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, id),
      columns: {
        password: false, // omitindo senha do retorno
      },
    });

    return {
      message: 'User updated successfully',
      user: updatedUser,
    };
  }
}
