import { Test, TestingModule } from '@nestjs/testing';

import * as sysMsg from '../../../constants/system.messages';
import { ClassLevel } from '../../shared/enums';
import { CreateClassDto, ClassResponseDto } from '../dto/create-class.dto';
import { GetTeachersQueryDto } from '../dto/get-teachers-query.dto';
import { TeacherAssignmentResponseDto } from '../dto/teacher-response.dto';
import { ClassService } from '../services/class.service';

import { ClassController } from './class.controller';

describe('ClassController', () => {
  let controller: ClassController;
  let service: ClassService;

  const mockClassService = {
    createClass: jest.fn(),
    getTeachersByClass: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassController],
      providers: [{ provide: ClassService, useValue: mockClassService }],
    }).compile();

    controller = module.get<ClassController>(ClassController);
    service = module.get<ClassService>(ClassService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createClass', () => {
    it('should create a class and return success response', async () => {
      const dto: CreateClassDto = {
        class_name: 'JSS2',
        level: ClassLevel.JUNIOR_SECONDARY,
        academic_session_id: 'c438779a-514a-47e1-9596-b21e0bf87334',
      };
      const created: ClassResponseDto = {
        id: '1',
        name: 'JSS2',
        level: ClassLevel.JUNIOR_SECONDARY,
        academicSession: {
          id: 'c438779a-514a-47e1-9596-b21e0bf87334',
          name: '2024-2025',
        },
      };
      mockClassService.createClass.mockResolvedValue(created);

      const result = await controller.createClass(dto);
      expect(result.message).toBe(sysMsg.CLASS_CREATED);
      expect(result.data).toEqual(created);
      expect(service.createClass).toHaveBeenCalledWith(dto);
    });
  });

  describe('getTeachers', () => {
    it('should return teacher assignments for a class', async () => {
      const classId = 'cf2740e6-eb20-4b2c-84c5-41f022e1d734';
      const query: GetTeachersQueryDto = { session_id: '2023-2024' };
      const teachers: TeacherAssignmentResponseDto[] = [
        {
          teacher_id: 't1',
          name: 'John Doe',
          assignment_date: new Date('2023-09-01T08:00:00Z'),
          streams: ['Science'],
        },
      ];
      mockClassService.getTeachersByClass.mockResolvedValue(teachers);

      const result = await controller.getTeachers(classId, query);
      expect(result).toEqual(teachers);
      expect(service.getTeachersByClass).toHaveBeenCalledWith(
        classId,
        query.session_id,
      );
    });
  });
});
