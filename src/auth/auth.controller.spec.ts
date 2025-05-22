import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service'; // Importar o AuthService
import { LoginDto } from './dto/login.dto'; // Importar o DTO de login

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService; // Declarar a instância mockada do AuthService

  // Antes de cada teste, vamos configurar o módulo de teste
  beforeEach(async () => {
    // Vamos criar um mock do AuthService.
    // Isso é crucial para testes unitários, pois isola o controlador.
    const authServiceMock = {
      login: jest.fn(), // Criar uma função mock para o método login
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService, // Quando o AuthController pedir AuthService,
          useValue: authServiceMock, // injetamos nosso mock
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService); // Obter a instância mockada para poder verificar seus métodos
  });

  // Teste básico para garantir que o controlador é definido
  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.login and return the result', async () => {
      // Cenário de teste: login bem-sucedido
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const expectedResult = { accessToken: 'mockedAccessToken' };

      // Configura o mock da função login do AuthService para retornar um valor específico
      (authService.login as jest.Mock).mockResolvedValue(expectedResult);

      // Chama o método login do controlador
      const result = await authController.login(loginDto);

      // Asserções:
      // 1. Verifica se o método login do AuthService foi chamado com os argumentos corretos
      expect(authService.login).toHaveBeenCalledWith(loginDto);
      // 2. Verifica se o resultado retornado pelo controlador é o mesmo que o mock do AuthService retornou
      expect(result).toEqual(expectedResult);
    });

    it('should handle unauthorized credentials (e.g., throw an UnauthorizedException)', async () => {
      // Cenário de teste: credenciais inválidas
      const loginDto: LoginDto = {
        email: 'invalid@example.com',
        password: 'wrongpassword',
      };

      // Configura o mock da função login do AuthService para rejeitar com um erro (simulando UnauthorizedException)
      // Neste caso, o AuthService provavelmente lançaria uma exceção HTTP do NestJS.
      // O controlador apenas repassa essa exceção.
      const unauthorizedError = new Error('Credenciais inválidas'); // Podemos simular um erro genérico aqui ou um HttpException específico

      (authService.login as jest.Mock).mockRejectedValue(unauthorizedError);

      // Esperamos que o método login do controlador jogue a mesma exceção
      await expect(authController.login(loginDto)).rejects.toThrow(
        unauthorizedError,
      );
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });

    // Você pode adicionar mais testes para validação de DTO, se o NestJS não estiver fazendo isso automaticamente antes de chegar ao controlador.
    // Por exemplo, se você tiver pipes de validação no NestJS, a validação de DTO já aconteceria antes de chegar ao controlador.
    // Se a validação for feita dentro do controlador, você precisaria testá-la aqui.
  });
});
