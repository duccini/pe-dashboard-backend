import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginInput } from './dto/login.input';
import * as bcrypt from 'bcrypt';
import { comparePasswords } from 'src/utils/hash-password';
import { UserType } from 'src/users/dto/user.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // Método que verifica se o usuário existe e se a senha está correta
  async login(loginDto: LoginInput) {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await comparePasswords(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Mapeia o _id para id e remove a senha do objeto do usuário
    const userForAuthResponse: UserType = {
      id: user._id.toString(), // Converte ObjectId para string e atribui a 'id'
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      // Não inclua a senha aqui
    };

    return {
      accessToken: this.jwtService.sign({
        userId: user._id.toString(), // Use _id aqui para o JWT payload, se necessário
        email: user.email,
        role: user.role,
      }),
      user: userForAuthResponse, // Retorne o objeto formatado com 'id'
    };
  }
}
