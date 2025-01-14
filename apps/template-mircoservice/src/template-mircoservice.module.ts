import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { loadEnvVarConfig } from './config/EnvVarConfig';
import { DbModule } from './internal/db/db.module';
import { PubSubModule } from './internal/pubSub/pubSub.module';
import { RedisClientModule } from './internal/redis/redisClient.module';
import { TemplateMircoServiceService } from './template-mircoservice.service';

@Module({
  imports: [
    RedisClientModule,
    PubSubModule,
    DbModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [loadEnvVarConfig],
    }),
  ],
  controllers: [TemplateMircoServiceService],
  providers: [TemplateMircoServiceService],
})
export class TemplateMircoserviceModule {}
