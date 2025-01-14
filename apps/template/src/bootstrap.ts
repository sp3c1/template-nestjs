import * as compression from 'compression';

import { NestFactory } from '@nestjs/core';
import {
  DocumentBuilder,
  SwaggerModule,
} from '@nestjs/swagger';

import { TemplateModule } from './template.module';

export async function bootstrap(path: string) {
  require('dotenv').config({ ...(path && { path }), override: true });

  const app = await NestFactory.create(TemplateModule);

  const config = new DocumentBuilder()
    .setTitle('Template API')
    .setDescription('The Template API Doc')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, document);

  app.use(compression());
  app.enableShutdownHooks();

  await app.listen(process.env.port ?? 3000);
}
