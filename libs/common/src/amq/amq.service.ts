import { Connection, create_container, Sender } from 'rhea';

import { DiscoveryService } from '@golevelup/nestjs-discovery';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  AMQ_RECEIVER_HANDLER,
  AMQ_SENDER_HANDLER,
  AmqPublishOpts,
  AmqSubscribeOpts,
} from './reciever-handler.dercorator';
import { IAmqConfig } from './types/config';
import { AckAmq } from './types/delivery';

@Injectable()
export class AmqService implements OnModuleInit, OnModuleDestroy {
  private connection: Connection | null = null;
  private senders: Record<string, Sender> = {};
  private receiverHandlers: Record<string, (data: Record<string, any>, delivery: AckAmq) => void> =
    {};

  constructor(private config: ConfigService, private discover: DiscoveryService) {}

  async onModuleInit() {
    this.connect();

    await this.bindReceiverHandlers();
    await this.bindSenderHandlers();
  }

  async onModuleDestroy() {
    this.close();
  }

  private connect() {
    try {
      Logger.log('AMQ: Connecting...');

      const containerId = `server_${Math.random().toString(16).slice(3)}`;
      const container = create_container({ id: containerId, autoaccept: false });

      container.on('error', (error) => {
        Logger.error('AMQ: General error', error);
      });

      container.on('connection_error', (error) => {
        Logger.error('AMQ: Connection error', error);
      });

      container.on('connection_open', () => {
        Logger.log('AMQ: Connection opened');
      });

      container.on('message', (context) => {
        Logger.log(`AMQ: Received message on ${context.receiver.name} ~ ${context.message.body}`);

        if (context.message.body === 'detach') {
          context.receiver.detach();
          context.connection.close();
          return;
        }

        if (context.message.body === 'close') {
          context.receiver.close();
          context.connection.close();
          return;
        }

        try {
          const bodyObject = JSON.parse(context.message.body);
          const handler = this.receiverHandlers[context.receiver.name];

          if (handler) {
            // Invoke the handler and await if necessary
            Promise.resolve(handler(bodyObject, context?.delivery))
              .then(() => {
                // Successfully handled the message
                // context.delivery.accept(); // manual accept
              })
              .catch((handlerError) => {
                // Handler threw an error
                Logger.error('Handler error', handlerError);
                // Optionally, decide to reject/release based on error type
                context.delivery.reject();
                // Or for a transient error, you might use:
                // context.delivery.release();
              });
          } else {
            Logger.warn(`No handler for receiver ${context.receiver.name}`);
            context.delivery.release();
          }
        } catch (error) {
          Logger.error('Error processing message', error);
          // Reject or release the message on error
          context.delivery.reject();
        }
      });

      container.on('sendable', (context) => {
        this.senders[context.sender.name] = context.sender;
      });

      const config = this.config.get<IAmqConfig>(`app.AMQ`);
      this.connection = container.connect({
        transport: <any>config.TRANSPORT, //  'tcp' | 'tls' | 'ssl'
        host: config.HOST,
        port: Number(config.PORT),
        username: config.USERNAME,
        password: config.PASSWORD,
        reconnect: 10000, // 10s between reconnects
      });
    } catch (error) {
      Logger.error('Error connecting', error);
    }
  }

  private close() {
    Logger.log('Closing connection...');

    this.connection?.close();
  }

  private async bindReceiverHandlers() {
    const receiversMeta = await this.discover.providerMethodsWithMetaAtKey<AmqSubscribeOpts>(
      AMQ_RECEIVER_HANDLER
    );

    receiversMeta.forEach(({ meta, discoveredMethod }) => {
      const receiverConfig = meta.receiver;

      Logger.log(
        `AMQ: Binding handler ${discoveredMethod.parentClass.name}.${discoveredMethod.methodName} to receiver ${receiverConfig.name}`
      );

      this.receiverHandlers[receiverConfig.name] = discoveredMethod.handler.bind(
        discoveredMethod.parentClass.instance
      );

      this.connection?.open_receiver(receiverConfig);
    });
  }

  private async bindSenderHandlers() {
    const sendersMeta = await this.discover.providerMethodsWithMetaAtKey<AmqPublishOpts>(
      AMQ_SENDER_HANDLER
    );

    sendersMeta.forEach(({ meta, discoveredMethod }) => {
      const senderConfig = meta.sender;

      Logger.log(
        `AMQ: Registering sender for ${discoveredMethod.parentClass.name}.${discoveredMethod.methodName} with ${senderConfig.name}`
      );

      if (this.senders[senderConfig.name]) {
        Logger.log(
          `AMQ: Skipped Registering sender for ${discoveredMethod.parentClass.name}.${discoveredMethod.methodName} with ${senderConfig.name} - already registered`
        );
        return;
      }

      // Open and store the sender for later use
      const sender = this.connection?.open_sender(senderConfig);
      if (sender) {
        this.senders[senderConfig.name] = sender;
      }
    });
  }

  send(senderName: string, data: Record<string, any>) {
    const sender = this.senders[senderName];

    Logger.log('AMQ: Sending message...', senderName, data);

    if (sender) {
      sender.send({
        body: JSON.stringify(data),
      });
    } else {
      Logger.error(`AMQ: No sender found for ${senderName}`);
    }
  }
}
