# Modify RMQ config for queues/topics

## Publishing

There is decorator `RmqPublish` that creates a published AMQ object. This decorator can be duplicated in other places that need publishers. Only one publisher will be created per topic/queue. `

```

```

## Subcriber

Use new decorator `@RmqSubscribe` in provider to listen to messages from queue/topic.

```

```

Library gives access to delivery methods - that allow for deciding what to do with the message. If messages is not released it will be seating on the broker.

Second argument provider interfaces `.ack()` and `.nack()` to manually close messages

## Env

For local setup copy values from example env

```
RMQ_HOST=localhost
RMQ_PORT=5673
RMQ_USERNAME=admin
RMQ_PASSWORD=admin
RMQ_PROTOCOL=amqp # or 'amqps'
```
