# Modify AMQ config for queues/topics

Modify `amq.config.ts` to you list of query/topics.

## Publishing

There is decorator `AmqPublish` that creates a published AMQ object. This decorator can be duplicated in other places that need publishers. Only one publisher will be created per topic/queue. `AmqPublish` uses `Rhea` `SenderOptions`.

```
@Resolver()
export class SomeResolve {
  constructor(
    private amqService: AmqService,
  ) {}

  @Query((_) => Boolean)
  @AmqPublish({
    sender: {
      name: 'example-queue.sender',
      target: {
        address: 'example.queue',
        durable: 2,
        expiry_policy: 'never',
      },
    } as SenderOptions,
  })
  async testPublish() {
    await this.amqService.send('example-queue.sender', { x: `test` });
    return true;
  }

```

## Subcriber

Use new decorator `@AmqSubscribe` in provider to listen to messages from queue/topic. . `AmqSubscribe` uses `Rhea` `ReceiverOptions`

```
  @AmqSubscribe({
    receiver: {
      name: 'example-queue.receiver',
      source: {
        // A queue declaration
        address: 'example.queue',
        durable: 2,
        expiry_policy: 'never',
      },
    } as ReceiverOptions,
  })
  async onExampleEvent(msg: any, delivery: AckAmq) {
    try {
      Logger.log(`Message received`, msg);
      delivery.accept();
    } catch (error) {
      Logger.error(error.message);
    }
  }
}
```

Library gives access to delivery methods - that allow for deciding what to do with the message. If messages is not released it will be seating on the broker.

Successful messages needs to to invoke `delivery.accept()` - this moves the message to finishes - it will not be read again.

The other two methods are `delivery.reject()` and `delivery.release()`. Both returns message to broker - meaning that message was not processed properly.

They would happen automatically if error on the handler (here in example `onExampleEvent`) is not handled and the error is propagated to service that handles AMQ message.

## Access Admin

Follow http://localhost:8161/ to get access to local admin.

## Env

For local setup copy values from example env

```

AMQ_TRANSPORT=tcp
AMQ_HOST=localhost
AMQ_PORT=5672
AMQ_USERNAME=admin
AMQ_PASSWORD=admin
```
