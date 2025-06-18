import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { UserRole } from '../roles.enum';

registerEnumType(UserRole, {
  name: 'UserRole',
});

@ObjectType()
export class UserType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field(() => UserRole)
  role: UserRole;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
