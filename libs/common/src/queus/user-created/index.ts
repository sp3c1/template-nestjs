import { Field, Int, ObjectType } from '@nestjs/graphql';

import { QueueTracking } from '../';

export const QueueUserCreated = 'user-created';
export interface QueueUserCreatedType extends QueueTracking {
  id: number;
  name: string;
}

@ObjectType()
export class QueueUserCreatedGQL {
  @Field((_) => String)
  requestId: string;

  @Field((_) => Int)
  id: number;

  @Field((_) => String)
  name: string;
}
