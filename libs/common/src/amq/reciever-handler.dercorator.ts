import { ReceiverOptions, SenderOptions } from 'rhea';

import { applyDecorators, SetMetadata } from '@nestjs/common';

export interface AmqSubscribeOpts {
  receiver: ReceiverOptions;
}

export const AMQ_RECEIVER_HANDLER = Symbol('AMQ_RECEIVER_HANDLER');

export const AmqSubscribe = (options: AmqSubscribeOpts) =>
  applyDecorators(SetMetadata(AMQ_RECEIVER_HANDLER, options));

export interface AmqPublishOpts {
  sender: SenderOptions;
}

export const AMQ_SENDER_HANDLER = Symbol('AMQ_SENDER_HANDLER');

export const AmqPublish = (options: AmqPublishOpts) =>
  applyDecorators(SetMetadata(AMQ_SENDER_HANDLER, options));
