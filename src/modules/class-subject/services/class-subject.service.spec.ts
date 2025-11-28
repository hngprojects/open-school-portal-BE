import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Class } from '../../class/entities/class.entity';
import { ClassModelAction } from '../../class/model-actions/class.actions';
import { Subject } from '../../subject/entities/subject.entity';
import { SubjectModelAction } from '../../subject/model-actions/subject.actions';
import { CreateClassSubjectDto } from '../dto/create-class-subject.dto';
import { ClassSubject } from '../entities/class-subject.entity';
import { ClassSubjectModelAction } from '../model-actions/class-subject.actions';

import { ClassSubjectService } from './class-subject.service';

describe('ClassSubjectService', () => {
  let service: ClassSubjectService;

  const MOCK_CLASS_SUBJECT_REPOSITORY = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    find: jest.fn(),
  };

  const MOCK_CLASS_MODEL_ACTION = {
    get: jest.fn(),
  };

  const MOCK_CLASS_SUBJECT_MODEL_ACTION = {
    create: jest.fn(),
  };

  const MOCK_SUBJECT_MODEL_ACTION = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassSubjectService,
        {
          provide: getRepositoryToken(ClassSubject),
          useValue: MOCK_CLASS_SUBJECT_REPOSITORY,
        },
        {
          provide: ClassModelAction,
          useValue: MOCK_CLASS_MODEL_ACTION,
        },
        {
          provide: SubjectModelAction,
          useValue: MOCK_SUBJECT_MODEL_ACTION,
        },
        {
          provide: ClassSubjectModelAction,
          useValue: MOCK_CLASS_SUBJECT_MODEL_ACTION,
        },
      ],
    }).compile();

    service = module.get<ClassSubjectService>(ClassSubjectService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('assignSubjectToClass', () => {
    const createDto: CreateClassSubjectDto = {
      className: 'Class A',
      arm: 'Science',
      subjectName: 'Math',
    };
    const mockClass = {
      id: 'class-id-1',
      name: 'Class A',
      arm: 'Science',
    } as Class;
    const mockSubject = { id: 'subject-id-1', name: 'Math' } as Subject;
    const mockClassSubject = {
      id: 'assignment-id-1',
      class: mockClass,
      subject: mockSubject,
    } as ClassSubject;

    it('should successfully assign a subject to a class', async () => {
      MOCK_CLASS_MODEL_ACTION.get.mockResolvedValue(mockClass);
      MOCK_SUBJECT_MODEL_ACTION.get.mockResolvedValue(mockSubject);
      MOCK_CLASS_SUBJECT_REPOSITORY.findOne.mockResolvedValue(null);
      MOCK_CLASS_SUBJECT_REPOSITORY.create.mockReturnValue(mockClassSubject);
      MOCK_CLASS_SUBJECT_REPOSITORY.save.mockResolvedValue(mockClassSubject);

      const result = await service.assignSubjectToClass(createDto);

      expect(MOCK_CLASS_MODEL_ACTION.get).toHaveBeenCalledWith({
        identifierOptions: { name: createDto.className, arm: createDto.arm },
      });
      expect(MOCK_SUBJECT_MODEL_ACTION.get).toHaveBeenCalledWith({
        identifierOptions: { name: createDto.subjectName },
      });
      expect(MOCK_CLASS_SUBJECT_REPOSITORY.findOne).toHaveBeenCalledWith({
        where: {
          class: { id: mockClass.id },
          subject: { id: mockSubject.id },
        },
      });
      expect(MOCK_CLASS_SUBJECT_REPOSITORY.create).toHaveBeenCalledWith({
        class: mockClass,
        subject: mockSubject,
      });
      expect(MOCK_CLASS_SUBJECT_REPOSITORY.save).toHaveBeenCalledWith(
        mockClassSubject,
      );
      expect(result).toEqual(mockClassSubject);
    });

    it('should throw BadRequestException if assignment already exists', async () => {
      MOCK_CLASS_MODEL_ACTION.get.mockResolvedValue(mockClass);
      MOCK_SUBJECT_MODEL_ACTION.get.mockResolvedValue(mockSubject);
      MOCK_CLASS_SUBJECT_REPOSITORY.findOne.mockResolvedValue(mockClassSubject);

      await expect(service.assignSubjectToClass(createDto)).rejects.toThrow(
        new BadRequestException('Subject is already assigned to this class.'),
      );
    });

    it('should throw NotFoundException if class does not exist', async () => {
      MOCK_CLASS_MODEL_ACTION.get.mockResolvedValue(null);

      await expect(service.assignSubjectToClass(createDto)).rejects.toThrow(
        new NotFoundException(
          `Class with name ${createDto.className} and arm ${createDto.arm} not found.`,
        ),
      );
    });

    it('should throw NotFoundException if subject does not exist', async () => {
      MOCK_CLASS_MODEL_ACTION.get.mockResolvedValue(mockClass);
      MOCK_SUBJECT_MODEL_ACTION.get.mockResolvedValue(null);

      await expect(service.assignSubjectToClass(createDto)).rejects.toThrow(
        new NotFoundException(
          `Subject with name ${createDto.subjectName} not found.`,
        ),
      );
    });
  });

  describe('removeSubjectFromClass', () => {
    const assignmentId = 'assignment-id-1';
    const mockClassSubject = { id: assignmentId } as ClassSubject;

    it('should successfully remove a subject from a class', async () => {
      MOCK_CLASS_SUBJECT_REPOSITORY.findOne.mockResolvedValue(mockClassSubject);
      MOCK_CLASS_SUBJECT_REPOSITORY.remove.mockResolvedValue(undefined);

      await service.removeSubjectFromClass(assignmentId);

      expect(MOCK_CLASS_SUBJECT_REPOSITORY.findOne).toHaveBeenCalledWith({
        where: { id: assignmentId },
      });
      expect(MOCK_CLASS_SUBJECT_REPOSITORY.remove).toHaveBeenCalledWith(
        mockClassSubject,
      );
    });

    it('should throw NotFoundException if assignment does not exist', async () => {
      MOCK_CLASS_SUBJECT_REPOSITORY.findOne.mockResolvedValue(null);

      await expect(
        service.removeSubjectFromClass(assignmentId),
      ).rejects.toThrow(
        new NotFoundException('Subject assignment to class not found.'),
      );
    });
  });

  describe('findSubjectsForClass', () => {
    const className = 'Class A';
    const arm = 'Science';
    const mockClass = { id: 'class-id-1', name: className, arm: arm } as Class;
    const mockClassSubjects = [
      { id: '1', class: mockClass, subject: { name: 'Math' } },
      { id: '2', class: mockClass, subject: { name: 'Science' } },
    ] as ClassSubject[];

    it('should return all subjects for a given class name', async () => {
      MOCK_CLASS_MODEL_ACTION.get.mockResolvedValue(mockClass);
      MOCK_CLASS_SUBJECT_REPOSITORY.find.mockResolvedValue(mockClassSubjects);

      const result = await service.findSubjectsForClass(className, arm);

      expect(MOCK_CLASS_MODEL_ACTION.get).toHaveBeenCalledWith({
        identifierOptions: { name: className, arm: arm },
      });
      expect(MOCK_CLASS_SUBJECT_REPOSITORY.find).toHaveBeenCalledWith({
        where: { class: { id: mockClass.id } },
        relations: ['subject'],
      });
      expect(result).toEqual(mockClassSubjects);
    });

    it('should throw NotFoundException if class does not exist', async () => {
      MOCK_CLASS_MODEL_ACTION.get.mockResolvedValue(null);

      await expect(
        service.findSubjectsForClass(className, arm),
      ).rejects.toThrow(
        new NotFoundException(
          `Class with name ${className} and arm ${arm} not found.`,
        ),
      );
    });
  });

  describe('findClassesForSubject', () => {
    const subjectName = 'Math';
    const mockSubject = { id: 'subject-id-1', name: subjectName } as Subject;
    const mockClassSubjects = [
      { id: '1', subject: mockSubject, class: { name: 'Class A' } },
      { id: '2', subject: mockSubject, class: { name: 'Class B' } },
    ] as ClassSubject[];

    it('should return all classes for a given subject name', async () => {
      MOCK_SUBJECT_MODEL_ACTION.get.mockResolvedValue(mockSubject);
      MOCK_CLASS_SUBJECT_REPOSITORY.find.mockResolvedValue(mockClassSubjects);

      const result = await service.findClassesForSubject(subjectName);

      expect(MOCK_SUBJECT_MODEL_ACTION.get).toHaveBeenCalledWith({
        identifierOptions: { name: subjectName },
      });
      expect(MOCK_CLASS_SUBJECT_REPOSITORY.find).toHaveBeenCalledWith({
        where: { subject: { id: mockSubject.id } },
        relations: ['class'],
      });
      expect(result).toEqual(mockClassSubjects);
    });

    it('should throw NotFoundException if subject does not exist', async () => {
      MOCK_SUBJECT_MODEL_ACTION.get.mockResolvedValue(null);

      await expect(service.findClassesForSubject(subjectName)).rejects.toThrow(
        new NotFoundException(`Subject with name ${subjectName} not found.`),
      );
    });
  });
});
