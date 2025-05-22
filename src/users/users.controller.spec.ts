import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UserRole } from './roles.enum';

// Mock de um usuário para ser usado nos testes
const mockUser: UserResponseDto = {
  id: 1,
  name: 'John Doe',
  email: 'john.doe@example.com',
  role: UserRole.USER,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock do UsersService
const mockUsersService = {
  create: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService; // Adicionamos uma referência ao serviço mockado

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService, // Fornece o mock do UsersService
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService); // Obtém a instância do serviço mockado
  });

  // Limpa os mocks após cada teste para garantir isolamento
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user and return a success message with user data', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        password: 'password123',
        role: UserRole.USER,
      };

      // Configura o mock do serviço para retornar um usuário mockado ao chamar 'create'
      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto);

      expect(result).toEqual({
        message: 'User created successfully',
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
        },
      });
      // Verifica se o método 'create' do serviço foi chamado com os DTOs corretos
      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should throw BadRequestException if creation fails (e.g., invalid data)', async () => {
      const createUserDto: CreateUserDto = {
        name: '', // Exemplo de dado inválido
        email: 'invalid-email',
        password: '123',
        role: UserRole.USER,
      };

      // Configura o mock do serviço para lançar um erro ao chamar 'create'
      // Isso simula uma validação de serviço ou um erro de banco de dados
      mockUsersService.create.mockRejectedValue(
        new BadRequestException('Invalid user data.'),
      );

      await expect(controller.create(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users: UserResponseDto[] = [
        mockUser,
        { ...mockUser, id: 2, email: 'another@example.com' },
      ];

      // Configura o mock do serviço para retornar uma lista de usuários
      mockUsersService.findAll.mockResolvedValue(users);

      const result = await controller.findAll();

      expect(result).toEqual(users);
      expect(mockUsersService.findAll).toHaveBeenCalled();
    });

    it('should return an empty array if no users are found', async () => {
      // Configura o mock do serviço para retornar um array vazio
      mockUsersService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
      expect(mockUsersService.findAll).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a user and return the updated user', async () => {
      const userId = 1;
      const updateUserDto: UpdateUserDto = { name: 'John Updated' };
      const updatedUser = { ...mockUser, name: 'John Updated' };

      // Configura o mock do serviço para retornar o usuário atualizado
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(userId, updateUserDto);

      expect(result).toEqual(updatedUser);
      expect(mockUsersService.update).toHaveBeenCalledWith(
        userId,
        updateUserDto,
      );
    });

    it('should throw NotFoundException if user to update is not found', async () => {
      const userId = 999; // ID de usuário inexistente
      const updateUserDto: UpdateUserDto = { name: 'Non Existent' };

      // Configura o mock do serviço para lançar uma exceção de "não encontrado"
      mockUsersService.update.mockRejectedValue(
        new NotFoundException(`User with ID ${userId} not found`),
      );

      await expect(controller.update(userId, updateUserDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockUsersService.update).toHaveBeenCalledWith(
        userId,
        updateUserDto,
      );
    });

    it('should throw BadRequestException if update data is invalid', async () => {
      const userId = 1;
      const updateUserDto: UpdateUserDto = { email: 'invalid-email' }; // Exemplo de dado inválido

      // Configura o mock do serviço para lançar uma exceção de "bad request"
      mockUsersService.update.mockRejectedValue(
        new BadRequestException('Invalid update data.'),
      );

      await expect(controller.update(userId, updateUserDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockUsersService.update).toHaveBeenCalledWith(
        userId,
        updateUserDto,
      );
    });
  });

  describe('remove', () => {
    it('should remove a user and return the removed user', async () => {
      const userId = 1;

      // Configura o mock do serviço para retornar o usuário removido (ou um indicador de sucesso)
      mockUsersService.remove.mockResolvedValue(mockUser); // Retorna o usuário que foi removido

      const result = await controller.remove(userId);

      expect(result).toEqual(mockUser); // Ou um objeto de sucesso, dependendo da sua implementação no service
      expect(mockUsersService.remove).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundException if user to remove is not found', async () => {
      const userId = 999; // ID de usuário inexistente

      // Configura o mock do serviço para lançar uma exceção de "não encontrado"
      mockUsersService.remove.mockRejectedValue(
        new NotFoundException(`User with ID ${userId} not found`),
      );

      await expect(controller.remove(userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockUsersService.remove).toHaveBeenCalledWith(userId);
    });
  });
});
