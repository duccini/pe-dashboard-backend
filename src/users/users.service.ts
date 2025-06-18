// users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { User } from './user.entity';
import { hashPassword } from '../utils/hash-password';

import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { ResultType } from 'src/common/dto/result.type';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // Função auxiliar para validar ObjectId
  private isValidObjectId(id: string): boolean {
    return ObjectId.isValid(id);
  }

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

  // Método para buscar um usuário pelo email
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  // Método para buscar um usuário pelo ID
  async findById(id: string): Promise<User | null> {
    if (!this.isValidObjectId(id)) {
      return null;
    }
    return this.usersRepository.findOne({
      where: { _id: new ObjectId(id) },
    });
  }

  // Método para buscar todos os usuários
  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  // Método para atualizar um usuário pelo ID
  async update(id: string, input: UpdateUserInput) {
    if (!this.isValidObjectId(id)) {
      throw new NotFoundException('Invalid user ID format');
    }

    const objectId = new ObjectId(id);
    const user = await this.usersRepository.findOne({
      where: { _id: objectId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (input.password) {
      input.password = await hashPassword(input.password);
    }

    await this.usersRepository.update(
      { _id: objectId },
      {
        ...input,
        updatedAt: new Date(),
      },
    );

    const updated = await this.usersRepository.findOne({
      where: { _id: objectId },
    });

    return updated;
  }

  // Método para deletar um usuário pelo ID
  async remove(id: string): Promise<ResultType> {
    if (!this.isValidObjectId(id)) {
      throw new NotFoundException('Invalid user ID format');
    }

    const objectId = new ObjectId(id);

    const userToDelete = await this.usersRepository.findOne({
      where: { _id: objectId },
    });

    if (!userToDelete) {
      // Se o usuário não for encontrado, lançamos uma exceção.
      throw new NotFoundException('User not found');
    }

    await this.usersRepository.delete({ _id: objectId });

    return {
      success: true,
      message: 'User deleted successfully',
      idAffected: id, // Retorna o ID do usuário que foi deletado
    };
  }
}
