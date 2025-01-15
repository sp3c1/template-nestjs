export interface IAppConfig {
  ACTIVE_PROFILE: string;
  DB: IDBConfig;
  REDIS: IRedisConfig;
  AUTH: IAuthConfig;
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
