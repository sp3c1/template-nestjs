import { Test, TestingModule } from '@nestjs/testing';

import { RestController } from './rest.controller';

describe('ApiController', () => {
  let controller: RestController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [RestController],
    }).compile();

    controller = app.get<RestController>(RestController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(controller.getHello()).toBe('Hello World!');
    });
  });
});
