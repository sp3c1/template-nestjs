import {
  forwardRef,
  Module,
} from '@nestjs/common';

import { UserModule } from '../gql/user/user.module';
import { PubSubModule } from '../internal/pubSub/pubSub.module';
import { RestController } from './rest.controller';

@Module({
  imports: [forwardRef(() => PubSubModule), forwardRef(() => UserModule)],
  controllers: [RestController],
  providers: [],
})
export class RestModule {}
