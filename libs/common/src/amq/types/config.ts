export interface IAmqConfig {
  TRANSPORT: 'tcp' | 'tls' | 'ssl';
  HOST: string;
  PORT: number;
  USERNAME: string;
  PASSWORD: string;
}
