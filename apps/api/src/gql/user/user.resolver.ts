import { createWriteStream } from 'fs';
import { PubSubEngine } from 'graphql-subscriptions';
import { FileUpload } from 'graphql-upload-ts';
import { join } from 'path';
import { ReceiverOptions, SenderOptions } from 'rhea';

import {
  FieldMap,
  QueueUserCreated,
  QueueUserCreatedGQL,
  UploadScalar,
  withCancel,
} from '@app/common';
import { AckAmq, AmqPublish, AmqService, AmqSubscribe } from '@app/common/amq';
import { ProjectionService, User } from '@app/common/coreModels';
import { AckRmq, RmqPublish, RmqService, RmqSubscribe } from '@app/common/rmq';
import { Inject, Logger } from '@nestjs/common';
import {
  Args,
  ArgsType,
  Context,
  Field,
  Int,
  Mutation,
  Query,
  Resolver,
  Subscription,
} from '@nestjs/graphql';

import { AllowedRoles, Roles } from '../../auth';
import { IContext } from '../config/apollo.config';
import { UserService } from './user.service';

@ArgsType()
class ArgsGetUser {
  @Field((_) => Int)
  id: number;
}

@ArgsType()
class ArgsCreateUser {
  @Field((_) => String)
  email: string;

  @Field((_) => String)
  name: string;
}

@ArgsType()
class ArgsLocalDonwnload {
  @Field((_) => UploadScalar)
  file: Promise<FileUpload>;
}

// v1 wi

@Resolver()
export class UserResolver {
  constructor(
    @Inject('PUB_SUB') private pubSub: PubSubEngine,
    private projection: ProjectionService,
    private userService: UserService,
    private amqService: AmqService,
    private rmqService: RmqService
  ) {}

  @Query((_) => User)
  user(@Args() { id }: ArgsGetUser, @FieldMap() fieldMap) {
    const projection = this.projection.user(fieldMap);
    return this.userService.findOneById(id, projection); // hydrate joins
  }

  @Mutation((_) => User)
  async createUser(@Args() { email, name }: ArgsCreateUser, @FieldMap() fieldMap) {
    const newUser = new User();
    newUser.email = email;
    newUser.name = name;

    await this.userService.insert(newUser);

    this.pubSub.publish('channel', newUser).finally();

    const projection = this.projection.user(fieldMap);
    return this.userService.findOneById(newUser.id, projection); // hydrate joins
  }

  @Roles([AllowedRoles.All])
  @Subscription(() => User, {
    nullable: true,
    filter: async (payload: { id }, variables: { id }, ctx: IContext) => {
      // FILTER OUT SOCKET ID OR USER ID IF ANONyMOUS
      return payload.id === variables.id;
    },
    resolve: (value) => {
      try {
        return value;
      } catch (_) {
        return null;
      }
    },
  })
  async userChange(@Args() { id }: ArgsGetUser, @Context() ctx: IContext) {
    return withCancel(this.pubSub.asyncIterator('channel'), async () => {
      // discconnect handling
    });
  }

  @Roles([AllowedRoles.All])
  @Subscription(() => QueueUserCreatedGQL, {
    nullable: true,
    filter: async (payload: { id }, variables: { id }, ctx: IContext) => {
      // FILTER OUT SOCKET ID OR USER ID IF ANONyMOUS
      // return payload.id === variables.id;
      return true;
    },
    resolve: (value: QueueUserCreatedGQL) => {
      try {
        return value;
      } catch (_) {
        return null;
      }
    },
  })
  async userCreated(@Context() ctx: IContext) {
    return withCancel(this.pubSub.asyncIterator(QueueUserCreated), async () => {
      // discconnect handling
    });
  }

  @Mutation(() => Boolean)
  async uploadFile(
    @Context() ctx: IContext,
    @Args() { file }: ArgsLocalDonwnload
  ): Promise<boolean> {
    const resolveFile = await file;

    // normally should go through presigned s3 links
    const uploadDir = join(process.cwd(), 'uploads');
    const filePath = join(uploadDir, resolveFile.filename);

    await new Promise((resolve, reject) =>
      resolveFile
        .createReadStream()
        .pipe(createWriteStream(filePath))
        .on('finish', () => resolve(true))
        .on('error', () => reject(false))
    );

    // ---
    return true;
  }

  @Query((_) => Boolean)
  @AmqPublish({
    sender: {
      name: 'send-email.sender',
      target: {
        address: 'send-email.queue',
        durable: 2,
        expiry_policy: 'never',
      },
    } as SenderOptions,
  })
  async sendEmail() {
    await this.amqService.send('send-email.sender', { email: `email@email` });
    return true;
  }

  @AmqSubscribe({
    receiver: {
      name: 'send-email.receiver',
      source: {
        // A queue declaration
        address: 'send-email.queue',
        durable: 2,
        expiry_policy: 'never',
      },
    } as ReceiverOptions,
  })
  async processSendEmail(msg: any, delivery: AckAmq) {
    try {
      Logger.log(`Message received`, msg);
      delivery.accept();
    } catch (error) {
      Logger.error(error.message);
    }
  }

  @Query((_) => Boolean)
  @RmqPublish({
    routingKey: 'send-email',
  })
  async sendEmailRmq() {
    await this.rmqService.send({ routingKey: 'send-email' }, { email: `email@email` });
    return true;
  }

  @RmqSubscribe({
    queue: 'send-email',
  })
  async processSendEmailRmq(msg: any, delivery: AckRmq) {
    try {
      Logger.log(`Message received`, msg);
      delivery.ack();
    } catch (error) {
      Logger.error(error.message);
    }
  }
}
