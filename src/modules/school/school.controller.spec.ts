// Mock external modules that have native dependencies BEFORE any imports
/* eslint-disable @typescript-eslint/naming-convention */
jest.mock('sharp', () => ({
  __esModule: true,
  default: jest.fn(),
}));
/* eslint-enable @typescript-eslint/naming-convention */
jest.mock('fs/promises', () => ({
  mkdir: jest.fn(),
  unlink: jest.fn(),
}));

import { Test, TestingModule } from '@nestjs/testing';

import { SchoolModelAction } from './model-actions/school-actions';
import { SchoolController } from './school.controller';
import { SchoolService } from './school.service';

describe('SchoolController', () => {
  let controller: SchoolController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SchoolController],
      providers: [
        SchoolService,
        {
          provide: SchoolModelAction,
          useValue: {
            get: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SchoolController>(SchoolController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
