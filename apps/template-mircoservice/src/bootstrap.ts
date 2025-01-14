import { NestFactory } from '@nestjs/core';

import { TemplateMircoserviceModule } from './template-mircoservice.module';

export async function bootstrap(path: string) {
  require('dotenv').config({ ...(path && { path }), override: true });

  await NestFactory.createApplicationContext(TemplateMircoserviceModule);
}
