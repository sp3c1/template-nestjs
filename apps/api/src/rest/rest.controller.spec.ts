import {
  Test,
  TestingModule,
} from '@nestjs/testing';

import { RestController } from './rest.controller';

describe('TemplateController', () => {
  let templateController: RestController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [RestController],
      // providers: [TemplateService],
    }).compile();

    templateController = app.get<RestController>(RestController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(templateController.getHello()).toBe('Hello World!');
    });
  });
});
