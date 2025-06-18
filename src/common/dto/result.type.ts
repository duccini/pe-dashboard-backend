import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class ResultType {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field(() => ID, { nullable: true }) // Opcional: ID do item afetado
  idAffected?: string;
}
