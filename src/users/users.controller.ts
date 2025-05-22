import {
  Body,
  Controller,
  Param,
  Patch,
  ParseIntPipe,
  Post,
  Get,
  Delete,
} from '@nestjs/common';

import {
  ApiTags,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Create a new user
  @Post()
  @ApiCreatedResponse({ description: 'Usuário criado com sucesso' })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  async create(@Body() dto: CreateUserDto) {
    const createdUser = await this.usersService.create(dto);

    // Mapear createdUser para UserResponseDto
    const userResponse: UserResponseDto = {
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
      role: createdUser.role,
      createdAt: createdUser.createdAt,
      updatedAt: createdUser.updatedAt,
    };

    return {
      message: 'User created successfully',
      user: userResponse,
    };
  }

  // Get all users
  @Get()
  @ApiOkResponse({ description: 'Lista de usuários retornada com sucesso' })
  findAll() {
    return this.usersService.findAll();
  }

  // Update a user by ID
  @Patch(':id')
  @ApiOkResponse({ description: 'Usuário atualizado com sucesso' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  // Delete a user by ID
  @Delete(':id')
  @ApiOkResponse({ description: 'Usuário deletado com sucesso' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
