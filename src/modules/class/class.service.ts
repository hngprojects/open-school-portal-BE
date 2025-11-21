import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as sysMsg from '../../constants/system.messages';
import { ClassLevel } from '../shared/enums';

import { CreateClassDto } from './dto/create-class.dto';
import { TeacherAssignmentResponseDto } from './dto/teacher-response.dto';
import { ClassTeacher } from './entities/class-teacher.entity';
import { Class } from './entities/class.entity';
import { ClassesModelAction } from './model-actions/class-action';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Class)
    private classRepository: Repository<Class>,
    @InjectRepository(ClassTeacher)
    private classTeacherRepository: Repository<ClassTeacher>,
    private readonly classesModelAction: ClassesModelAction,
  ) {}
  /**
   * Creates a new class with validation and uniqueness check.
   */
  async createClass(createClassDto: CreateClassDto): Promise<Class> {
    // 1. Validate class name
    const name = createClassDto.class_name.trim();
    if (!name) {
      throw new BadRequestException(sysMsg.INVALID_CLASS_PARAMETER);
    }
    // 2. Validate level
    if (!Object.values(ClassLevel).includes(createClassDto.level)) {
      throw new BadRequestException(sysMsg.INVALID_CLASS_PARAMETER);
    }
    // 3. Check for duplicate class name
    const existing = await this.classRepository.findOne({ where: { name } });
    if (existing) {
      throw new BadRequestException(sysMsg.CLASS_ALREADY_EXISTS);
    }
    // 4. Create class using Model Action
    const newClass = await this.classesModelAction.create({
      createPayload: {
        name,
        level: createClassDto.level,
      },
      transactionOptions: { useTransaction: false },
    });
    return newClass;
  }

  /**
   * Fetches teachers for a specific class and session.
   */
  async getTeachersByClass(
    classId: string,
    sessionId?: string,
  ): Promise<TeacherAssignmentResponseDto[]> {
    // 1. Validate Class Existence
    const class_exitst = await this.classRepository.findOne({
      where: { id: classId },
    });
    if (!class_exitst) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }

    // 2. Handle Session Logic (Default to active if null)
    const target_session = sessionId || (await this.getActiveSession());

    // 3. Fetch Assignments with Relations
    // We join 'class' here to access the 'stream' property
    const assignments = await this.classTeacherRepository.find({
      where: {
        class: { id: classId },
        session_id: target_session,
        is_active: true,
      },
      relations: ['teacher', 'teacher.user', 'class'],
      select: {
        id: true,
        teacher: {
          id: true,
          employmentId: true,
        },
        class: {
          id: true,
          streams: true,
        },
      },
    });

    // 4. Map to DTO
    return assignments.map((assignment) => ({
      teacher_id: assignment.teacher.id,
      name: assignment.teacher.user
        ? `${assignment.teacher.user.first_name} ${assignment.teacher.user.last_name}`
        : `Teacher ${assignment.teacher.employmentId}`,
      assignment_date: assignment.createdAt,
      streams: assignment.class.streams?.map((s) => s.name) || [],
    }));
  }

  // Mock helper for active session
  private async getActiveSession(): Promise<string> {
    return '2024-2025';
  }
}
