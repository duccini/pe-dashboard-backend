import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsOptional, IsString, IsEnum } from 'class-validator';
import { UserRole } from '../roles.enum';

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  password?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(UserRole, {
    message: 'role must be one of: user, admin, super-admin',
  })
  role?: UserRole;
}
