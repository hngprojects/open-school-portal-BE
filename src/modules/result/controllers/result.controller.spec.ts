import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { UserRole } from '../../shared/enums';
import { ResultService } from '../services/result.service';

import { ResultController } from './result.controller';

interface IRequestWithUser extends Request {
  user: {
    id: string;
    userId: string;
    teacher_id?: string;
    student_id?: string;
    parent_id?: string;
    roles: UserRole[];
  };
}

describe('ResultController', () => {
  let controller: ResultController;
  let resultService: jest.Mocked<ResultService>;

  const mockStudentId = 'student-uuid-123';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResultController],
      providers: [
        {
          provide: ResultService,
          useValue: {
            generateClassResults: jest.fn(),
            generateStudentResult: jest.fn(),
            getResultById: jest.fn(),
            getStudentResults: jest.fn(),
            getClassResults: jest.fn(),
            listResults: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ResultController>(ResultController);
    resultService = module.get(ResultService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getStudentResults', () => {
    it('should return student results', async () => {
      const mockRequestWithStudent = {
        user: {
          id: 'user-uuid-123',
          userId: 'user-uuid-123',
          student_id: mockStudentId,
          roles: [UserRole.STUDENT],
        },
      };

      const expectedResult = {
        data: [],
        meta: {},
      };

      resultService.getStudentResults.mockResolvedValue(expectedResult);

      const result = await controller.getStudentResults(
        mockRequestWithStudent as unknown as IRequestWithUser,
        mockStudentId,
        {},
      );

      expect(result).toEqual(expectedResult);
      expect(resultService.getStudentResults).toHaveBeenCalledWith(
        mockStudentId,
        {},
      );
    });

    it('should throw ForbiddenException when student tries to access another student results', async () => {
      const mockRequestWithDifferentStudent = {
        user: {
          id: 'user-uuid-123',
          userId: 'user-uuid-123',
          student_id: 'different-student-uuid',
          roles: [UserRole.STUDENT],
        },
      };

      await expect(
        controller.getStudentResults(
          mockRequestWithDifferentStudent as unknown as IRequestWithUser,
          mockStudentId,
          {},
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
