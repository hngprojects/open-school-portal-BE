import { Test, TestingModule } from '@nestjs/testing';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { DepartmentResponseDto } from '../dto/department-response.dto';
import { IBaseResponse } from '../interface/types';
import { DepartmentModelAction } from '../model-actions/department.actions';
import { DepartmentService } from '../services/department.service';

import { DepartmentController } from './department.controller';

describe('DepartmentController', () => {
  let controller: DepartmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DepartmentController],
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
            findAll: jest.fn(), // Add mock for findAll
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

    controller = module.get<DepartmentController>(DepartmentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  interface IMeta {
    total: number;
    lastPage: number;
    currentPage: number;
    perPage: number;
  }

  describe('findAll', () => {
    it('should return a list of departments with default pagination parameters', async () => {
      const result: IBaseResponse<DepartmentResponseDto[]> & { meta: IMeta } = {
        message: 'Departments retrieved successfully',
        data: [{ id: '1', name: 'Science' } as DepartmentResponseDto],
        meta: { total: 1, lastPage: 1, currentPage: 1, perPage: 10 },
      };
      jest
        .spyOn(controller['departmentService'], 'findAll')
        .mockResolvedValue(result);

      expect(await controller.findAll()).toEqual(result);
      expect(controller['departmentService'].findAll).toHaveBeenCalledWith({
        page: undefined,
        limit: undefined,
      });
    });

    it('should return a list of departments with valid provided pagination parameters', async () => {
      const result: IBaseResponse<DepartmentResponseDto[]> & { meta: IMeta } = {
        message: 'Departments retrieved successfully',
        data: [{ id: '2', name: 'Arts' } as DepartmentResponseDto],
        meta: { total: 1, lastPage: 1, currentPage: 2, perPage: 5 },
      };
      jest
        .spyOn(controller['departmentService'], 'findAll')
        .mockResolvedValue(result);

      const page = '2';
      const limit = '5';
      expect(await controller.findAll(page, limit)).toEqual(result);
      expect(controller['departmentService'].findAll).toHaveBeenCalledWith({
        page: 2,
        limit: 5,
      });
    });

    it('should return a list of departments with invalid pagination parameters treated as undefined', async () => {
      const result: IBaseResponse<DepartmentResponseDto[]> & { meta: IMeta } = {
        message: 'Departments retrieved successfully',
        data: [{ id: '3', name: 'Commerce' } as DepartmentResponseDto],
        meta: { total: 1, lastPage: 1, currentPage: 1, perPage: 10 },
      };
      jest
        .spyOn(controller['departmentService'], 'findAll')
        .mockResolvedValue(result);

      const page = 'invalid';
      const limit = 'text';
      expect(await controller.findAll(page, limit)).toEqual(result);
      expect(controller['departmentService'].findAll).toHaveBeenCalledWith({
        page: undefined,
        limit: undefined,
      });
    });
  });
});
