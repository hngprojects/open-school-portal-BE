import { Test, TestingModule } from '@nestjs/testing';

import { CreateDepartmentDto } from '../dto/create-department.dto';
import { DepartmentResponseDto } from '../dto/department-response.dto';
import { UpdateDepartmentDto } from '../dto/update-department.dto';
import { IBaseResponse } from '../interface/types';
import { DepartmentModelAction } from '../model-actions/department.actions';
import { DepartmentService } from '../services/department.service';

import { DepartmentController } from './department.controller';

describe('DepartmentController', () => {
  let controller: DepartmentController;
  let departmentService: {
    create: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
    findAll: jest.Mock;
  };

  beforeEach(async () => {
    departmentService = {
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findAll: jest.fn(),
    };

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
          provide: DepartmentService,
          useValue: departmentService,
        },
      ],
    }).compile();

    controller = module.get<DepartmentController>(DepartmentController);
  });

  afterEach(() => {
    jest.clearAllMocks();
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

  describe('create', () => {
    const createDepartmentDto: CreateDepartmentDto = {
      name: 'Science',
    };

    it('should delegate to DepartmentService and return its response', async () => {
      const serviceResponse = {
        message: 'Department created successfully',
        data: { id: 'dept-1', name: 'Science' },
      };
      departmentService.create.mockResolvedValue(serviceResponse);

      await expect(controller.create(createDepartmentDto)).resolves.toEqual(
        serviceResponse,
      );
      expect(departmentService.create).toHaveBeenCalledWith(
        createDepartmentDto,
      );
    });

    it('should propagate errors thrown by DepartmentService', async () => {
      const error = new Error('Creation failed');
      departmentService.create.mockRejectedValue(error);

      await expect(controller.create(createDepartmentDto)).rejects.toThrow(
        error,
      );
      expect(departmentService.create).toHaveBeenCalledWith(
        createDepartmentDto,
      );
    });
  });

  describe('update', () => {
    const departmentId = 'dept-1';
    const updateDto: UpdateDepartmentDto = { name: 'Science & Technology' };

    it('should delegate to DepartmentService and return its response', async () => {
      const serviceResponse = {
        message: 'Department updated successfully',
        data: { id: departmentId, name: 'Science & Technology' },
      };
      departmentService.update.mockResolvedValue(serviceResponse);

      await expect(controller.update(departmentId, updateDto)).resolves.toEqual(
        serviceResponse,
      );
      expect(departmentService.update).toHaveBeenCalledWith(
        departmentId,
        updateDto,
      );
    });

    it('should propagate errors thrown by DepartmentService', async () => {
      const error = new Error('Update failed');
      departmentService.update.mockRejectedValue(error);

      await expect(controller.update(departmentId, updateDto)).rejects.toThrow(
        error,
      );
      expect(departmentService.update).toHaveBeenCalledWith(
        departmentId,
        updateDto,
      );
    });
  });

  describe('remove', () => {
    const departmentId = 'dept-1';

    it('should delegate to DepartmentService and return its response', async () => {
      const serviceResponse = {
        message: 'Department deleted successfully',
        data: undefined,
      };
      departmentService.remove.mockResolvedValue(serviceResponse);

      await expect(controller.remove(departmentId)).resolves.toEqual(
        serviceResponse,
      );
      expect(departmentService.remove).toHaveBeenCalledWith(departmentId);
    });

    it('should propagate errors thrown by DepartmentService', async () => {
      const error = new Error('Deletion failed');
      departmentService.remove.mockRejectedValue(error);

      await expect(controller.remove(departmentId)).rejects.toThrow(error);
      expect(departmentService.remove).toHaveBeenCalledWith(departmentId);
    });
  });
});
