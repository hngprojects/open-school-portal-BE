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

import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { CreateInstallationDto } from './dto/create-installation.dto';
import { School } from './entities/school.entity';
import { SchoolModelAction } from './model-actions/school-actions';
import { SchoolService } from './school.service';

describe('SchoolService', () => {
  let service: SchoolService;
  let schoolModelAction: jest.Mocked<SchoolModelAction>;

  const mockSchoolModelAction = {
    get: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchoolService,
        {
          provide: SchoolModelAction,
          useValue: mockSchoolModelAction,
        },
      ],
    }).compile();

    service = module.get<SchoolService>(SchoolService);
    schoolModelAction = module.get(SchoolModelAction);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processInstallation', () => {
    const validDto: CreateInstallationDto = {
      school_name: 'Test School',
      primary_color: '#1E40AF',
      secondary_color: '#3B82F6',
      accent_color: '#60A5FA',
    };

    it('should successfully create school installation', async () => {
      const mockSchool: Partial<School> = {
        id: 'uuid-123',
        school_name: 'Test School',
        logo_url: null,
        primary_color: '#1E40AF',
        secondary_color: '#3B82F6',
        accent_color: '#60A5FA',
        installation_completed: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      schoolModelAction.get.mockResolvedValue(null);
      schoolModelAction.create.mockResolvedValue(mockSchool as School);

      const result = await service.processInstallation(validDto);

      expect(result).toEqual({
        id: 'uuid-123',
        school_name: 'Test School',
        logo_url: null,
        primary_color: '#1E40AF',
        secondary_color: '#3B82F6',
        accent_color: '#60A5FA',
        installation_completed: true,
        message: 'school installation completed successfully',
      });

      expect(schoolModelAction.get).toHaveBeenCalledTimes(2);
      expect(schoolModelAction.create).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictException if installation already completed', async () => {
      const existingSchool: Partial<School> = {
        id: 'existing-uuid',
        installation_completed: true,
      };

      schoolModelAction.get.mockResolvedValue(existingSchool as School);

      await expect(service.processInstallation(validDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.processInstallation(validDto)).rejects.toThrow(
        'school installation already completed',
      );
    });

    it('should throw ConflictException if school name already exists', async () => {
      const existingSchool: Partial<School> = {
        id: 'existing-uuid',
        school_name: 'Test School',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      schoolModelAction.get
        .mockResolvedValueOnce(null) // No completed installation
        .mockResolvedValueOnce(existingSchool as School); // But name exists

      await expect(service.processInstallation(validDto)).rejects.toThrow(
        'already exists',
      );
    });

    it('should handle installation without optional colors', async () => {
      const minimalDto: CreateInstallationDto = {
        school_name: 'Minimal School',
      };

      const mockSchool: Partial<School> = {
        id: 'uuid-456',
        school_name: 'Minimal School',
        logo_url: null,
        primary_color: null,
        secondary_color: null,
        accent_color: null,
        installation_completed: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      schoolModelAction.get.mockResolvedValue(null);
      schoolModelAction.create.mockResolvedValue(mockSchool as School);

      const result = await service.processInstallation(minimalDto);

      expect(result.school_name).toBe('Minimal School');
      expect(result.primary_color).toBeNull();
      expect(result.installation_completed).toBe(true);
    });
  });
});
