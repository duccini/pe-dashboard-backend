import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';

import { db } from '../db';
import { User, users } from '../db/schema';
import { hashPassword } from '../utils/hash-password';

import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';

@Injectable()
export class UsersService {
  // Método para criar um novo usuário
  async create(createUserDto: CreateUserInput) {
    const hashedPassword = await hashPassword(createUserDto.password);

    await db.insert(users).values({
      name: createUserDto.name,
      email: createUserDto.email,
      role: createUserDto.role,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const newUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, createUserDto.email),
    });

    if (!newUser) {
      throw new Error('Failed to retrieve newly created user.'); // Ou uma exceção mais específica
    }

    return newUser;
  }

  // Método para buscar um usuário pelo ID
  async findByEmail(email: string): Promise<User | undefined> {
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });

    return user ?? undefined;
  }

  // Método para buscar todos os usuários
  async findAll() {
    return await db.select().from(users);
  }

  // Método para atualizar um usuário pelo ID
  async update(id: number, updateUserDto: UpdateUserInput) {
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

  // Método para deletar um usuário pelo ID
  async remove(id: number) {
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, id),
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await db.delete(users).where(eq(users.id, id));

    return { message: 'User deleted successfully', user };
  }
}
