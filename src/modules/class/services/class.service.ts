import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as sysMsg from '../../../constants/system.messages';
import { ClassLevel } from '../../shared/enums';
import { Stream } from '../../stream/entities/stream.entity';
import { CreateClassDto } from '../dto/create-class.dto';
import { TeacherAssignmentResponseDto } from '../dto/teacher-response.dto';
import { ClassTeacher } from '../entities/class-teacher.entity';
import { Class } from '../entities/class.entity';
import { ClassTeacherModelAction } from '../model-actions/class-teacher.action';
import { ClassModelAction } from '../model-actions/class.actions';

@Injectable()
export class ClassService {
  constructor(
    @InjectRepository(ClassTeacher)
    private classTeacherRepository: Repository<ClassTeacher>,
    private readonly classesModelAction: ClassModelAction,
    private readonly classTeacherModelAction: ClassTeacherModelAction,
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
    const existing = await this.classesModelAction.get({
      identifierOptions: { name },
    });
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
    const classExist = await this.classesModelAction.get({
      identifierOptions: { id: classId },
    });

    if (!classExist) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }

    // 2. Handle Session Logic (Default to active if null)
    const target_session = sessionId || (await this.getActiveSession());

    // 3. Fetch Assignments with Relations
    const assignments = await this.classTeacherModelAction.list({
      filterRecordOptions: {
        class: { id: classId },
        session_id: target_session,
        is_active: true,
      },
      relations: {
        teacher: { user: true },
        class: true,
      },
    });

    // 4. Map to DTO
    return assignments.payload.map((assignment) => ({
      teacher_id: assignment.teacher.id,
      name: assignment.teacher.user
        ? `${assignment.teacher.user.first_name} ${assignment.teacher.user.last_name}`
        : `Teacher ${assignment.teacher.employment_id}`,
      assignment_date: assignment.assignment_date,
      streams: assignment.class.streams
        ? assignment.class.streams.map((s: Stream) => s.name)
        : [],
    }));
  }

  // Mock helper for active session
  private async getActiveSession(): Promise<string> {
    return '2024-2025';
  }
}
