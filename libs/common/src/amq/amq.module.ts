import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import { Module } from '@nestjs/common';

import { AmqService } from './amq.service';

@Module({
  imports: [DiscoveryModule],
  providers: [AmqService],
  exports: [AmqService],
})
export class AmqModule {}
