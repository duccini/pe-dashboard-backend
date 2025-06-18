import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { hashPassword } from '../utils/hash-password';

import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // Método para criar um novo usuário
  async create(createUserDto: CreateUserInput): Promise<User> {
    const hashedPassword = await hashPassword(createUserDto.password);

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    if (!user) {
      throw new Error('Failed to retrieve newly created user.');
    }

    return await this.usersRepository.save(user);
  }

  // Método para buscar um usuário pelo ID
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  // Método para buscar todos os usuários
  async findAll() {
    return this.usersRepository.find();
  }

  // Método para atualizar um usuário pelo ID
  async update(id: number, input: UpdateUserInput) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (input.password) {
      input.password = await hashPassword(input.password);
    }

    await this.usersRepository.update(id, {
      ...input,
      updatedAt: new Date(),
    });

    const updated = await this.usersRepository.findOne({ where: { id } });
    return {
      message: 'User updated successfully',
      user: updated,
    };
  }

  // Método para deletar um usuário pelo ID
  async remove(id: number) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    await this.usersRepository.delete(id);
    return {
      message: 'User deleted successfully',
      user,
    };
  }
}
