import { Test, TestingModule } from '@nestjs/testing';

import {
  CreateTeacherDto,
  UpdateTeacherDto,
  TeacherResponseDto,
  GetTeachersQueryDto,
  GetTeachersWithPaginationQueryDto,
} from './dto';
import { GeneratePasswordResponseDto } from './dto/generate-password-response.dto';
import { TeacherTitle } from './enums/teacher.enum';
import { TeacherController } from './teacher.controller';
import { TeacherService } from './teacher.service';

describe('TeacherController', () => {
  let controller: TeacherController;
  let teacherService: TeacherService;

  const mockTeacherService = {
    generatePassword: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    findAllWithPagination: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockTeacherResponse: TeacherResponseDto = {
    id: 'teacher-uuid-123',
    employment_id: 'EMP-2025-014',
    title: TeacherTitle.MISS,
    first_name: 'Favour',
    last_name: 'Chinaza',
    middle_name: 'Chinaza',
    email: 'favourchinaza110@gmail.com',
    phone: '+234 810 942 3124',
    gender: 'Female',
    date_of_birth: new Date('1990-11-23'),
    home_address: '123 Main Street',
    is_active: true,
    photo_url: 'uploads/teachers/EMP-2025-014.jpg',
    full_name: 'Miss Favour Chinaza',
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeacherController],
      providers: [
        {
          provide: TeacherService,
          useValue: mockTeacherService,
        },
      ],
    }).compile();

    controller = module.get<TeacherController>(TeacherController);
    teacherService = module.get<TeacherService>(TeacherService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('generatePassword', () => {
    it('should generate a password successfully', async () => {
      const mockPasswordResponse: GeneratePasswordResponseDto = {
        password: 'GeneratedPass123',
        strength: 'strong',
      };

      mockTeacherService.generatePassword.mockResolvedValue(
        mockPasswordResponse,
      );

      const result = await controller.generatePassword();

      expect(teacherService.generatePassword).toHaveBeenCalled();
      expect(result).toEqual(mockPasswordResponse);
    });
  });

  describe('create', () => {
    const createDto: CreateTeacherDto = {
      title: TeacherTitle.MISS,
      first_name: 'Favour',
      last_name: 'Chinaza',
      middle_name: 'Chinaza',
      email: 'favourchinaza110@gmail.com',
      gender: 'Female',
      date_of_birth: '1990-11-23',
      phone: '+234 810 942 3124',
      home_address: '123 Main Street',
      is_active: true,
    };

    it('should create a teacher successfully', async () => {
      mockTeacherService.create.mockResolvedValue(mockTeacherResponse);

      const result = await controller.create(createDto);

      expect(teacherService.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockTeacherResponse);
    });
  });

  describe('findAll', () => {
    it('should return list of teachers without pagination', async () => {
      const query: GetTeachersQueryDto = {
        sort_by: 'created_at',
        order: 'desc',
      };

      const mockResponse = {
        data: [mockTeacherResponse],
      };

      mockTeacherService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(query);

      expect(teacherService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockResponse);
      expect(result).toHaveProperty('data');
      expect(result).not.toHaveProperty('total');
    });

    it('should filter by active status', async () => {
      const query: GetTeachersQueryDto = {
        is_active: true,
        sort_by: 'created_at',
        order: 'desc',
      };

      const mockResponse = {
        data: [mockTeacherResponse],
      };

      mockTeacherService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(query);

      expect(teacherService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockResponse);
    });

    it('should search by name, email, or employment ID', async () => {
      const query: GetTeachersQueryDto = {
        search: 'Favour',
        sort_by: 'created_at',
        order: 'desc',
      };

      const mockResponse = {
        data: [mockTeacherResponse],
      };

      mockTeacherService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(query);

      expect(teacherService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findAllWithPagination', () => {
    it('should return paginated list of teachers', async () => {
      const query: GetTeachersWithPaginationQueryDto = {
        page: 1,
        limit: 20,
        sort_by: 'created_at',
        order: 'desc',
      };

      const mockResponse = {
        data: [mockTeacherResponse],
        total: 1,
        page: 1,
        limit: 20,
        total_pages: 1,
      };

      mockTeacherService.findAllWithPagination.mockResolvedValue(mockResponse);

      const result = await controller.findAllWithPagination(query);

      expect(teacherService.findAllWithPagination).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockResponse);
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('page');
      expect(result).toHaveProperty('limit');
      expect(result).toHaveProperty('total_pages');
    });

    it('should filter by active status with pagination', async () => {
      const query: GetTeachersWithPaginationQueryDto = {
        page: 1,
        limit: 20,
        is_active: true,
        sort_by: 'created_at',
        order: 'desc',
      };

      const mockResponse = {
        data: [mockTeacherResponse],
        total: 1,
        page: 1,
        limit: 20,
        total_pages: 1,
      };

      mockTeacherService.findAllWithPagination.mockResolvedValue(mockResponse);

      const result = await controller.findAllWithPagination(query);

      expect(teacherService.findAllWithPagination).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findOne', () => {
    const teacherId = 'teacher-uuid-123';

    it('should return a teacher by ID', async () => {
      mockTeacherService.findOne.mockResolvedValue(mockTeacherResponse);

      const result = await controller.findOne(teacherId);

      expect(teacherService.findOne).toHaveBeenCalledWith(teacherId);
      expect(result).toEqual(mockTeacherResponse);
    });
  });

  describe('update', () => {
    const teacherId = 'teacher-uuid-123';
    const updateDto: UpdateTeacherDto = {
      first_name: 'Updated',
      last_name: 'Name',
    };

    it('should update a teacher successfully', async () => {
      const updatedTeacher = {
        ...mockTeacherResponse,
        ...updateDto,
      };

      mockTeacherService.update.mockResolvedValue(updatedTeacher);

      const result = await controller.update(teacherId, updateDto);

      expect(teacherService.update).toHaveBeenCalledWith(teacherId, updateDto);
      expect(result).toEqual(updatedTeacher);
    });
  });

  describe('remove', () => {
    const teacherId = 'teacher-uuid-123';

    it('should deactivate a teacher successfully', async () => {
      mockTeacherService.remove.mockResolvedValue(undefined);

      await controller.remove(teacherId);

      expect(teacherService.remove).toHaveBeenCalledWith(teacherId);
    });
  });
});
