import { IAmqConfig } from '@app/common/amq/types/config';
import { IRmqConfig } from '@app/common/rmq/types/config';

export interface IAppConfig {
  ACTIVE_PROFILE: string;
  DB: IDBConfig;
  REDIS: IRedisConfig;
  AUTH: IAuthConfig;
  RMQ: IRmqConfig;
  AMQ: IAmqConfig;
}

export interface IRedisConfig {
  HOST: string;
  PORT: number;
  PASSWORD: string;
  NAMESPACE: string;
}

export interface IAuthConfig {
  API_KEY: string;
  SECRET: string;
}

export interface IDBConfig {
  HOSTNAME: string;
  TYPE: string;
  PORT: number;
  USERNAME: string;
  PASSWORD: string;
  DATABASE: string;
  SYNCHRONIZE: boolean;
  LOGGING: boolean;
}
