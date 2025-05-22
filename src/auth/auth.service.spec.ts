import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { UnauthorizedException } from '@nestjs/common';

// Mockar a função comparePasswords, já que ela é uma importação externa
jest.mock('src/utils/hash-password', () => ({
  comparePasswords: jest.fn(),
}));

// Importar a função mockada para poder configurá-la nos testes
import { comparePasswords } from 'src/utils/hash-password';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    // Limpar o estado de todos os mocks antes de cada teste
    jest.clearAllMocks(); // <--- ADICIONE ESTA LINHA AQUI

    const usersServiceMock = {
      findByEmail: jest.fn(),
    };

    const jwtServiceMock = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('login', () => {
    const mockLoginDto: LoginDto = {
      email: 'test@example.com',
      password: 'correctPassword',
    };
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      password: 'hashedCorrectPassword',
      role: 'user',
    };
    const mockAccessToken = 'mockedAccessToken';

    it('should successfully log in a user with valid credentials', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (comparePasswords as jest.Mock).mockResolvedValue(true);
      (jwtService.sign as jest.Mock).mockReturnValue(mockAccessToken);

      const result = await authService.login(mockLoginDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(mockLoginDto.email);
      expect(comparePasswords).toHaveBeenCalledWith(
        mockLoginDto.password,
        mockUser.password,
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
      expect(result).toEqual({
        access_token: mockAccessToken,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
        },
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(authService.login(mockLoginDto)).rejects.toThrow(
        new UnauthorizedException('Credenciais inválidas'),
      );

      expect(usersService.findByEmail).toHaveBeenCalledWith(mockLoginDto.email);
      expect(comparePasswords).not.toHaveBeenCalled(); // Agora deve passar
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (comparePasswords as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(mockLoginDto)).rejects.toThrow(
        new UnauthorizedException('Credenciais inválidas'),
      );

      expect(usersService.findByEmail).toHaveBeenCalledWith(mockLoginDto.email);
      expect(comparePasswords).toHaveBeenCalledWith(
        mockLoginDto.password,
        mockUser.password,
      );
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user has no password', async () => {
      const userWithoutPassword = { ...mockUser, password: undefined };
      (usersService.findByEmail as jest.Mock).mockResolvedValue(
        userWithoutPassword,
      );
      (comparePasswords as jest.Mock).mockResolvedValue(false); // mockResolvedValue(false) for safety if comparePasswords gets undefined

      await expect(authService.login(mockLoginDto)).rejects.toThrow(
        new UnauthorizedException('Credenciais inválidas'),
      );

      expect(usersService.findByEmail).toHaveBeenCalledWith(mockLoginDto.email);
      expect(comparePasswords).toHaveBeenCalledWith(
        mockLoginDto.password,
        userWithoutPassword.password,
      );
    });
  });
});
