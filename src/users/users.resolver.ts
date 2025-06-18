import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { UserType } from './dto/user.type';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { ResultType } from 'src/common/dto/result.type';

@Resolver(() => UserType)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [UserType])
  @UseGuards(GqlAuthGuard)
  async users(): Promise<UserType[]> {
    return this.usersService.findAll();
  }

  @Query(() => UserType, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async user(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<UserType | null> {
    return this.usersService.findById(id);
  }

  @Mutation(() => UserType)
  async createUser(@Args('input') input: CreateUserInput): Promise<UserType> {
    return this.usersService.create(input);
  }

  @Mutation(() => UserType)
  @UseGuards(GqlAuthGuard)
  async updateUser(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateUserInput,
  ): Promise<any> {
    return this.usersService.update(id, input);
  }

  @Mutation(() => UserType)
  @UseGuards(GqlAuthGuard)
  async removeUser(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<ResultType> {
    return this.usersService.remove(id);
  }
}
