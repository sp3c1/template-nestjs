import { RedisPubSub } from 'graphql-redis-subscriptions';

import {
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';

@Injectable()
export class TemplateMircoServiceService implements OnModuleInit {
  constructor(@Inject('PUB_SUB') private readonly pubSub: RedisPubSub) {}

  async onModuleInit() {
    // Replace 'yourChannelName' with the desired Redis channel name
    const subscriptionId = await this.pubSub.subscribe('user-created', (message: any) => {
      this.handleMessage(message);
    });

    Logger.log(`Subscribed to channel 'user-created' with subscriptionId: ${subscriptionId}`);
  }

  private handleMessage(message: any) {
    // Process incoming messages from the channel
    Logger.log(`Received message on channel: ${JSON.stringify(message)}`);
    // Add custom logic to handle the message
  }
}
