import { UploadScalar } from '@app/common';
import { AmqModule } from '@app/common/amq';
import { CoreModule } from '@app/common/coreModels';
import { RmqModule } from '@app/common/rmq';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';

import { loadEnvVarConfig } from './config/EnvVarConfig';
import { apolloConfigFactory } from './gql/config/apollo.config';
import { UserModule } from './gql/user/user.module';
import { DbModule } from './internal/db/db.module';
import { ContextFillMiddleware } from './internal/middleware/context.middleware';
import { PubSubModule } from './internal/pubSub/pubSub.module';
import { RedisClientModule } from './internal/redis/redisClient.module';
import { RestModule } from './rest/rest.module';

@Module({
  imports: [
    DbModule,
    RedisClientModule,
    PubSubModule,
    RmqModule,
    AmqModule,

    CoreModule,

    RestModule,
    UserModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory: apolloConfigFactory,
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [loadEnvVarConfig],
    }),
  ],
  controllers: [],
  providers: [UploadScalar],
})
export class ApiModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ContextFillMiddleware).forRoutes('/api/*');
  }
}
