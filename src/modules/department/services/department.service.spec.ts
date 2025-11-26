import { Test, TestingModule } from '@nestjs/testing';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import * as sysMsg from '../../../constants/system.messages';
import { Department } from '../entities/department.entity';
import { DepartmentModelAction } from '../model-actions/department.actions';

import { DepartmentService } from './department.service';

const mockDepartment: Department = {
  id: 'a716e159-4a94-4d8b-8a8b-3e1b7c0c1b7c',
  name: 'Science',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const departmentResponse = {
  message: sysMsg.DEPARTMENT_RETRIEVED_SUCCESS,
  data: {
    id: mockDepartment.id,
    name: mockDepartment.name,
    created_at: mockDepartment.createdAt,
    updated_at: mockDepartment.updatedAt,
  },
};

describe('DepartmentService', () => {
  let service: DepartmentService;
  let departmentModelAction: DepartmentModelAction;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartmentService,
        {
          provide: DepartmentModelAction,
          useValue: {
            get: jest.fn(),
            list: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: {
            child: jest.fn().mockReturnValue({
              log: jest.fn(),
              error: jest.fn(),
              warn: jest.fn(),
              debug: jest.fn(),
              verbose: jest.fn(),
            }),
          } as unknown as Logger,
        },
      ],
    }).compile();

    service = module.get<DepartmentService>(DepartmentService);
    departmentModelAction = module.get<DepartmentModelAction>(
      DepartmentModelAction,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a department if found', async () => {
      jest
        .spyOn(departmentModelAction, 'get')
        .mockResolvedValue(mockDepartment);

      await expect(service.findOne(mockDepartment.id)).resolves.toEqual(
        departmentResponse,
      );
      expect(departmentModelAction.get).toHaveBeenCalledWith({
        identifierOptions: { id: mockDepartment.id },
      });
    });

    it('should throw NotFoundException if department is not found', async () => {
      jest.spyOn(departmentModelAction, 'get').mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        sysMsg.DEPARTMENT_NOT_FOUND,
      );
      expect(departmentModelAction.get).toHaveBeenCalledWith({
        identifierOptions: { id: 'non-existent-id' },
      });
    });

    it('should handle invalid ID format gracefully (e.g., return null from model action)', async () => {
      jest.spyOn(departmentModelAction, 'get').mockResolvedValue(null);

      await expect(service.findOne('invalid-id-format')).rejects.toThrow(
        sysMsg.DEPARTMENT_NOT_FOUND,
      );
      expect(departmentModelAction.get).toHaveBeenCalledWith({
        identifierOptions: { id: 'invalid-id-format' },
      });
    });
  });
});
