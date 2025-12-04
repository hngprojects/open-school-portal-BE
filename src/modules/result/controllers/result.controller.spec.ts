import { Test, TestingModule } from '@nestjs/testing';

import { GenerateResultDto, ResultResponseDto } from '../dto';
import { ResultService } from '../services/result.service';

import { ResultController } from './result.controller';

describe('ResultController', () => {
  let controller: ResultController;
  let resultService: jest.Mocked<ResultService>;

  const mockStudentId = 'student-uuid-123';
  const mockClassId = 'class-uuid-123';
  const mockTermId = 'term-uuid-123';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResultController],
      providers: [
        {
          provide: ResultService,
          useValue: {
            generateClassResults: jest.fn(),
            getResultById: jest.fn(),
            getClassResults: jest.fn(),
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

  describe('generateResults', () => {
    it('should generate results for a class', async () => {
      const generateDto: GenerateResultDto = {
        class_id: mockClassId,
        term_id: mockTermId,
      };

      const expectedResult = {
        message: 'Successfully generated 10 result(s)',
        generated_count: 10,
        result_ids: [
          'result-uuid-1',
          'result-uuid-2',
          'result-uuid-3',
          'result-uuid-4',
          'result-uuid-5',
          'result-uuid-6',
          'result-uuid-7',
          'result-uuid-8',
          'result-uuid-9',
          'result-uuid-10',
        ],
      };

      resultService.generateClassResults.mockResolvedValue(expectedResult);

      const result = await controller.generateResults(generateDto);

      expect(result).toEqual(expectedResult);
      expect(resultService.generateClassResults).toHaveBeenCalledWith(
        mockClassId,
        mockTermId,
        undefined,
      );
    });
  });

  describe('getResultById', () => {
    it('should return a result by ID', async () => {
      const resultId = 'result-uuid-123';
      const expectedResult: ResultResponseDto = {
        id: resultId,
        student: {
          id: mockStudentId,
          registration_number: 'STU001',
        },
        class: {
          id: mockClassId,
          name: 'SS1',
        },
        term: {
          id: mockTermId,
          name: 'FIRST',
        },
        academicSession: {
          id: 'session-uuid-123',
          name: '2024/2025',
        },
        total_score: 450,
        average_score: 75,
        grade_letter: 'B',
        position: 5,
        remark: 'Very Good',
        subject_count: 6,
        subject_lines: [],
        generated_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      };

      resultService.getResultById.mockResolvedValue(expectedResult);

      const result = await controller.getResultById(resultId);

      expect(result).toEqual(expectedResult);
      expect(resultService.getResultById).toHaveBeenCalledWith(resultId);
    });
  });

  describe('getClassResults', () => {
    it('should return class results with statistics', async () => {
      const expectedResult = {
        message: 'Results retrieved successfully',
        data: {
          results: [
            {
              id: 'result-uuid-1',
              student: {
                id: mockStudentId,
                registration_number: 'STU001',
                name: 'John Doe',
              },
              class: {
                id: mockClassId,
                name: 'SS1',
                arm: 'A',
              },
              term: {
                id: mockTermId,
                name: 'FIRST',
              },
              academicSession: {
                id: 'session-uuid-123',
                name: '2024/2025',
                academicYear: '2024/2025',
              },
              total_score: 450,
              average_score: 75,
              grade_letter: 'B',
              position: 1,
              remark: 'Very Good',
              subject_count: 6,
              subject_lines: [],
              generated_at: new Date(),
              created_at: new Date(),
              updated_at: new Date(),
            },
          ],
          class_statistics: {
            highest_score: 85,
            lowest_score: 65,
            class_average: 75,
            total_students: 10,
          },
        },
        pagination: {
          total: 10,
          page: 1,
          limit: 20,
          total_pages: 1,
          has_next: false,
          has_previous: false,
        },
      };

      resultService.getClassResults.mockResolvedValue(expectedResult);

      const result = await controller.getClassResults(
        mockClassId,
        mockTermId,
        undefined,
        1,
        20,
      );

      expect(result).toEqual(expectedResult);
      expect(resultService.getClassResults).toHaveBeenCalledWith(
        mockClassId,
        mockTermId,
        undefined,
        1,
        20,
      );
    });

    it('should pass academic_session_id when provided', async () => {
      const sessionId = 'session-uuid-456';
      const expectedResult = {
        message: 'Results retrieved successfully',
        data: {
          results: [],
          class_statistics: {
            highest_score: null,
            lowest_score: null,
            class_average: null,
            total_students: 0,
          },
        },
        pagination: {
          total: 0,
          page: 1,
          limit: 20,
          total_pages: 0,
          has_next: false,
          has_previous: false,
        },
      };

      resultService.getClassResults.mockResolvedValue(expectedResult);

      const result = await controller.getClassResults(
        mockClassId,
        mockTermId,
        sessionId,
        undefined,
        undefined,
      );

      expect(result).toEqual(expectedResult);
      expect(resultService.getClassResults).toHaveBeenCalledWith(
        mockClassId,
        mockTermId,
        sessionId,
        1,
        20,
      );
    });
  });
});
