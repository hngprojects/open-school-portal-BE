import { Test, TestingModule } from '@nestjs/testing';

import { ApiSuccessResponseDto } from '../../common/dto/response.dto';
import * as sysMsg from '../../constants/system.messages';
import { ClassLevel } from '../shared/enums';

import { ClassesController } from './class.controller';
import { ClassesService } from './class.service';

describe('ClassesController', () => {
  let controller: ClassesController;
  let service: ClassesService;

  interface IServiceMock {
    createClass: jest.Mock;
    getAllClassesGroupedByLevel: jest.Mock;
    getTeachersByClass: jest.Mock;
  }

  beforeEach(async () => {
    const serviceMock: IServiceMock = {
      createClass: jest.fn(),
      getAllClassesGroupedByLevel: jest.fn(),
      getTeachersByClass: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassesController],
      providers: [{ provide: ClassesService, useValue: serviceMock }],
    }).compile();

    controller = module.get<ClassesController>(ClassesController);
    service = module.get<ClassesService>(ClassesService);
  });

  describe('createClass', () => {
    it('should return ApiSuccessResponseDto with created class', async () => {
      const dto = { class_name: 'JSS2', level: ClassLevel.JUNIOR_SECONDARY };
      const created = {
        id: 'uuid',
        name: 'JSS2',
        level: ClassLevel.JUNIOR_SECONDARY,
      };
      (service.createClass as jest.Mock).mockResolvedValue(created);

      const result = await controller.createClass(dto);
      expect(service.createClass).toHaveBeenCalledWith(dto);
      expect(result).toEqual(
        new ApiSuccessResponseDto(sysMsg.CLASS_CREATED, created),
      );
    });
  });

  describe('getAllClasses', () => {
    it('should return ApiSuccessResponseDto with grouped classes', async () => {
      const grouped = [
        {
          level: 'Junior Secondary',
          classes: [
            {
              id: 'uuid',
              name: 'JSS2',
              level: 'Junior Secondary',
              stream_count: 2,
              streams: ['A', 'B'],
            },
          ],
        },
      ];
      (service.getAllClassesGroupedByLevel as jest.Mock).mockResolvedValue(
        grouped,
      );

      const result = await controller.getAllClasses();
      expect(service.getAllClassesGroupedByLevel).toHaveBeenCalled();
      expect(result).toEqual(
        new ApiSuccessResponseDto(sysMsg.OPERATION_SUCCESSFUL, grouped),
      );
    });
  });

  describe('getTeachers', () => {
    it('should return teachers for a class and session', async () => {
      const teachers = [
        {
          teacher_id: 't1',
          name: 'John Doe',
          assignment_date: '2025-01-01',
          streams: ['A'],
        },
      ];
      (service.getTeachersByClass as jest.Mock).mockResolvedValue(teachers);
      const classId = 'class-uuid';
      const query: { session_id: string } = { session_id: '2024-2025' };

      const result = await controller.getTeachers(classId, query);
      expect(service.getTeachersByClass).toHaveBeenCalledWith(
        classId,
        query.session_id,
      );
      expect(result).toEqual(teachers);
    });

    it('should return teachers for a class with no session (default)', async () => {
      const teachers = [
        {
          teacher_id: 't2',
          name: 'Jane Doe',
          assignment_date: '2025-01-02',
          streams: ['B'],
        },
      ];
      (service.getTeachersByClass as jest.Mock).mockResolvedValue(teachers);
      const classId = 'class-uuid';

      const result = await controller.getTeachers(classId, {});
      expect(service.getTeachersByClass).toHaveBeenCalledWith(
        classId,
        undefined,
      );
      expect(result).toEqual(teachers);
    });
  });
});
