import { User } from '@app/common/coreModels';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IAppConfig } from '../../config/load/config.interface';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [],
      // https://docs.nestjs.com/techniques/database
      useFactory: <any>((configService: ConfigService) => ({
        type: configService.get<IAppConfig>('app').DB.TYPE,
        host: configService.get<IAppConfig>('app').DB.HOSTNAME,
        port: configService.get<IAppConfig>('app').DB.PORT,
        username: configService.get<IAppConfig>('app').DB.USERNAME,
        password: configService.get<IAppConfig>('app').DB.PASSWORD,
        database: configService.get<IAppConfig>('app').DB.DATABASE,
        entities: [User],
        synchronize: true,
        logging: configService.get<IAppConfig>('app').DB.LOGGING,
        cache: {
          type: 'ioredis',
          duration: 5000, // 5 seconds
          options: {
            host: configService.get<IAppConfig>('app').REDIS.HOST,
            password: configService.get<IAppConfig>('app').REDIS.PASSWORD,
            port: configService.get<IAppConfig>('app').REDIS.PORT,
            database: 1,
          },
        },
      })),
      inject: [ConfigService],
    }),
  ],
  exports: [TypeOrmModule],
})
export class DbModule {}
