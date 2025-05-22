// users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

// Importar UserRole
import { users } from '../db/schema';
import { UserRole } from 'src/users/roles.enum';

jest.mock('../utils/hash-password', () => ({
  hashPassword: jest.fn((password) => Promise.resolve(`hashed_${password}`)),
}));
import { hashPassword } from '../utils/hash-password';

// Corrigir o mock de 'db' para trabalhar corretamente com o chain de métodos
jest.mock('../db', () => {
  const mockDb = {
    insert: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
    select: jest.fn(),
    query: {
      users: {
        findFirst: jest.fn(),
      },
    },
  };

  // Configurar o chain de métodos para insert
  mockDb.insert.mockReturnValue({
    values: jest.fn().mockResolvedValue({}),
  });

  // Configurar o chain de métodos para update
  mockDb.update.mockReturnValue({
    set: jest.fn().mockReturnValue({
      where: jest.fn().mockResolvedValue({}),
    }),
  });

  // Configurar o chain de métodos para delete
  mockDb.delete.mockReturnValue({
    where: jest.fn().mockResolvedValue({}),
  });

  // Configurar o chain de métodos para select
  mockDb.select.mockReturnValue({
    from: jest.fn().mockResolvedValue([]),
  });

  return { db: mockDb };
});
import { db } from '../db';

jest.mock('../db/schema', () => ({
  users: {},
  User: {},
  UserRole: {
    // Mock UserRole para garantir que esteja disponível
    ADMIN: 'admin',
    USER: 'user',
    EDITOR: 'editor',
  },
}));
import { eq } from 'drizzle-orm';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'plainPassword',
      role: UserRole.USER,
    };

    const mockNewUser = {
      id: 1,
      name: createUserDto.name,
      email: createUserDto.email,
      role: UserRole.USER,
      password: 'hashed_plainPassword',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create a new user and return it', async () => {
      (hashPassword as jest.Mock).mockResolvedValue('hashed_plainPassword');

      // Configurar o mock para a inserção no Drizzle
      const mockInsertChain = {
        values: jest.fn().mockResolvedValue({}),
      };
      (db.insert as jest.Mock).mockReturnValue(mockInsertChain);

      // Configurar o mock para o findFirst que agora vai buscar o usuário recém-criado
      (db.query.users.findFirst as jest.Mock).mockResolvedValue(mockNewUser);

      const result = await service.create(createUserDto);

      expect(hashPassword).toHaveBeenCalledWith(createUserDto.password);
      expect(db.insert).toHaveBeenCalledWith(users);
      expect(mockInsertChain.values).toHaveBeenCalledWith(
        expect.objectContaining({
          name: createUserDto.name,
          email: createUserDto.email,
          role: createUserDto.role,
          password: 'hashed_plainPassword',
        }),
      );
      expect(db.query.users.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.any(Function),
        }),
      );
      expect(result).toEqual(mockNewUser);
    });

    it('should throw an error if newly created user cannot be retrieved', async () => {
      (hashPassword as jest.Mock).mockResolvedValue('hashed_plainPassword');

      const mockInsertChain = {
        values: jest.fn().mockResolvedValue({}),
      };
      (db.insert as jest.Mock).mockReturnValue(mockInsertChain);

      // Simula que o findFirst não encontrou o usuário após a inserção
      (db.query.users.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.create(createUserDto)).rejects.toThrow(
        'Failed to retrieve newly created user.',
      );

      expect(db.insert).toHaveBeenCalled();
      expect(db.query.users.findFirst).toHaveBeenCalled();
    });
  });

  describe('findByEmail', () => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedPassword',
      role: UserRole.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return a user if found by email', async () => {
      (db.query.users.findFirst as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(db.query.users.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.any(Function),
        }),
      );
      expect(result).toEqual(mockUser);
    });

    it('should return undefined if user not found by email', async () => {
      (db.query.users.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(db.query.users.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.any(Function),
        }),
      );
      expect(result).toBeUndefined();
    });
  });

  describe('findAll', () => {
    const mockUsers = [
      {
        id: 1,
        name: 'User 1',
        email: 'user1@example.com',
        password: 'hashed',
        role: UserRole.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: 'User 2',
        email: 'user2@example.com',
        password: 'hashed',
        role: UserRole.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should return an array of all users', async () => {
      const mockSelectChain = {
        from: jest.fn().mockResolvedValue(mockUsers),
      };
      (db.select as jest.Mock).mockReturnValue(mockSelectChain);

      const result = await service.findAll();

      expect(db.select).toHaveBeenCalled();
      expect(mockSelectChain.from).toHaveBeenCalledWith(users);
      expect(result).toEqual(mockUsers);
    });

    it('should return an empty array if no users are found', async () => {
      const mockSelectChain = {
        from: jest.fn().mockResolvedValue([]),
      };
      (db.select as jest.Mock).mockReturnValue(mockSelectChain);

      const result = await service.findAll();

      expect(db.select).toHaveBeenCalled();
      expect(mockSelectChain.from).toHaveBeenCalledWith(users);
      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    const mockUser = {
      id: 1,
      name: 'Old Name',
      email: 'old@example.com',
      password: 'oldHashedPassword',
      role: UserRole.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const updateUserDto: UpdateUserDto = {
      name: 'New Name',
      email: 'new@example.com',
    };
    const updateUserDtoWithPassword: UpdateUserDto = {
      name: 'New Name',
      password: 'newPassword',
    };
    const updateUserDtoWithRole: UpdateUserDto = {
      role: UserRole.ADMIN,
    };

    it('should update a user and return success message with updated user (without password)', async () => {
      // Mock para a verificação inicial de usuário existente
      (db.query.users.findFirst as jest.Mock)
        .mockResolvedValueOnce(mockUser) // Primeira chamada (para verificar se existe)
        .mockResolvedValueOnce({
          ...mockUser,
          ...updateUserDto,
          password: undefined,
          role: UserRole.USER,
        }); // Segunda chamada (para retornar o usuário atualizado, sem senha)

      // Mock para a operação de update do Drizzle
      const mockUpdateChain = {
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue({}),
        }),
      };
      (db.update as jest.Mock).mockReturnValue(mockUpdateChain);

      const result = await service.update(mockUser.id, updateUserDto);

      expect(db.query.users.findFirst).toHaveBeenCalledTimes(2);
      expect(db.update).toHaveBeenCalledWith(users);
      expect(mockUpdateChain.set).toHaveBeenCalledWith(
        expect.objectContaining({
          name: updateUserDto.name,
          email: updateUserDto.email,
          updatedAt: expect.any(Date),
        }),
      );
      expect(result.message).toBe('User updated successfully');
      expect(result.user).toEqual(
        expect.objectContaining({
          ...updateUserDto,
          id: mockUser.id,
          password: undefined,
          role: UserRole.USER,
        }),
      );
    });

    it('should update user password if new password is provided', async () => {
      (hashPassword as jest.Mock).mockResolvedValue('hashed_newPassword');

      // Mock para a verificação inicial de usuário existente
      (db.query.users.findFirst as jest.Mock)
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce({
          ...mockUser,
          password: undefined,
          name: updateUserDtoWithPassword.name,
          role: UserRole.USER,
        });

      const mockUpdateChain = {
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue({}),
        }),
      };
      (db.update as jest.Mock).mockReturnValue(mockUpdateChain);

      await service.update(mockUser.id, updateUserDtoWithPassword);

      expect(hashPassword).toHaveBeenCalledWith(
        updateUserDtoWithPassword.password,
      );
      expect(mockUpdateChain.set).toHaveBeenCalledWith(
        expect.objectContaining({
          password: 'hashed_newPassword',
        }),
      );
    });

    it('should update user role if new role is provided', async () => {
      // Mock para a verificação inicial de usuário existente
      (db.query.users.findFirst as jest.Mock)
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce({
          ...mockUser,
          password: undefined,
          role: updateUserDtoWithRole.role,
        });

      const mockUpdateChain = {
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue({}),
        }),
      };
      (db.update as jest.Mock).mockReturnValue(mockUpdateChain);

      await service.update(mockUser.id, updateUserDtoWithRole);

      expect(mockUpdateChain.set).toHaveBeenCalledWith(
        expect.objectContaining({
          role: updateUserDtoWithRole.role,
        }),
      );
    });

    it('should throw NotFoundException if user to update is not found', async () => {
      (db.query.users.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.update(999, updateUserDto)).rejects.toThrow(
        new NotFoundException('User not found'),
      );

      expect(db.query.users.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.any(Function) }),
      );
      expect(db.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedPassword',
      role: UserRole.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should delete a user and return success message with the deleted user', async () => {
      (db.query.users.findFirst as jest.Mock).mockResolvedValue(mockUser);

      const mockDeleteChain = {
        where: jest.fn().mockResolvedValue({}),
      };
      (db.delete as jest.Mock).mockReturnValue(mockDeleteChain);

      const result = await service.remove(mockUser.id);

      expect(db.query.users.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.any(Function) }),
      );
      expect(db.delete).toHaveBeenCalledWith(users);
      expect(mockDeleteChain.where).toHaveBeenCalledWith(expect.any(Object));
      expect(result.message).toBe('User deleted successfully');
      expect(result.user).toEqual(mockUser);
    });

    it('should throw NotFoundException if user to remove is not found', async () => {
      (db.query.users.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(
        new NotFoundException('User not found'),
      );

      expect(db.query.users.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.any(Function) }),
      );
      expect(db.delete).not.toHaveBeenCalled();
    });
  });
});
