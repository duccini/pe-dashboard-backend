import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginInput } from './dto/login.input';
import * as bcrypt from 'bcrypt';
import { comparePasswords } from 'src/utils/hash-password';

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

    const { password, ...payload } = user;
    return {
      accessToken: this.jwtService.sign({
        userId: user.id,
        email: user.email,
        role: user.role,
      }),
      user: payload,
    };
  }
}
