import { RedisPubSub } from 'graphql-redis-subscriptions';

import { QueueUserCreated } from '@app/common';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';

@Injectable()
export class MircoServiceService implements OnModuleInit {
  constructor(@Inject('PUB_SUB') private readonly pubSub: RedisPubSub) {}

  async onModuleInit() {
    const subscriptionId = await this.pubSub.subscribe(QueueUserCreated, (message: any) => {
      this.handleMessage(message);
    });

    Logger.log(
      `Subscribed to channel '${QueueUserCreated}' with subscriptionId: ${subscriptionId}`
    );
  }

  private handleMessage(message: any) {
    // Process incoming messages from the channel
    Logger.log(`Received message on channel: ${JSON.stringify(message)}`);
    // Add custom logic to handle the message
  }
}
