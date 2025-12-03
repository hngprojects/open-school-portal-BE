import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { DataSource } from 'typeorm';
import { Logger } from 'winston';

import * as sysMsg from '../../../constants/system.messages';
import {
  AcademicSession,
  SessionStatus,
} from '../../academic-session/entities/academic-session.entity';
import { AcademicSessionModelAction } from '../../academic-session/model-actions/academic-session-actions';
import { Stream } from '../../stream/entities/stream.entity';
import { StudentModelAction } from '../../student/model-actions/student-actions';
import { TeacherModelAction } from '../../teacher/model-actions/teacher-actions';
import {
  CreateClassDto,
  TeacherAssignmentResponseDto,
  UpdateClassDto,
  AssignStudentsToClassDto,
  StudentAssignmentResponseDto,
  ClassResponseDto,
} from '../dto';
import { ClassStudent } from '../entities/class-student.entity';
import { ClassStudentModelAction } from '../model-actions/class-student.action';
import { ClassModelAction } from '../model-actions/class.actions';
import {
  ICreateClassResponse,
  IUpdateClassResponse,
  IGetClassByIdResponse,
} from '../types/base-response.interface';

@Injectable()
export class ClassService {
  private readonly logger: Logger;
  constructor(
    private readonly classModelAction: ClassModelAction,
    private readonly sessionModelAction: AcademicSessionModelAction,
    private readonly classStudentModelAction: ClassStudentModelAction,
    private readonly studentModelAction: StudentModelAction,
    private readonly academicSessionModelAction: AcademicSessionModelAction,
    private readonly teacherModelAction: TeacherModelAction,
    private readonly dataSource: DataSource,
    @Inject(WINSTON_MODULE_PROVIDER) baseLogger: Logger,
  ) {
    this.logger = baseLogger.child({ context: ClassService.name });
  }

  /**
   * Maps a Teacher entity to a TeacherInfoDto.
   * Returns null if teacher is null or undefined.
   */
  private mapTeacherToDetailsDto(
    teacher: {
      id: string;
      employment_id: string;
      user?: { first_name: string; last_name: string };
    } | null,
  ): { id: string; name: string; employment_id: string } | null {
    if (!teacher) {
      return null;
    }

    return {
      id: teacher.id,
      name: teacher.user
        ? `${teacher.user.first_name} ${teacher.user.last_name}`
        : `Teacher ${teacher.employment_id}`,
      employment_id: teacher.employment_id,
    };
  }

  /**
   * Fetches the form teacher for a specific class.
   * Optionally filters by session ID.
   */
  async getTeachersByClass(
    classId: string,
    sessionId?: string,
  ): Promise<TeacherAssignmentResponseDto[]> {
    const classEntity = await this.classModelAction.get({
      identifierOptions: { id: classId },
      relations: {
        teacher: { user: true },
        streams: true,
        academicSession: true,
      },
    });

    if (!classEntity || classEntity.is_deleted) {
      throw new NotFoundException(sysMsg.CLASS_NOT_FOUND);
    }

    // If sessionId is provided, validate that the class belongs to that session
    if (sessionId && classEntity.academicSession.id !== sessionId) {
      throw new NotFoundException(sysMsg.CLASS_NOT_FOUND);
    }

    // If no teacher assigned, return empty array
    if (!classEntity.teacher) {
      return [];
    }

    // Return single teacher as array for backward compatibility
    const streamList: Stream[] = classEntity.streams || [];
    const streamNames = streamList.map((s) => s.name).join(', ');

    return [
      {
        teacher_id: classEntity.teacher.id,
        name: classEntity.teacher.user
          ? `${classEntity.teacher.user.first_name} ${classEntity.teacher.user.last_name}`
          : `Teacher ${classEntity.teacher.employment_id}`,
        assignment_date: classEntity.createdAt,
        streams: streamNames,
      },
    ];
  }

  /**
   * Creates a class and links it to the active academic session.
   */
  async create(createClassDto: CreateClassDto): Promise<ICreateClassResponse> {
    const { name, arm, teacherIds } = createClassDto;

    // Extract first teacher ID from array if provided
    const teacherId =
      teacherIds && teacherIds.length > 0 ? teacherIds[0] : undefined;

    let teacherDetails = null;
    // Validate teacher exists if teacherId is provided
    if (teacherId) {
      const teacher = await this.teacherModelAction.get({
        identifierOptions: { id: teacherId },
        relations: { user: true },
      });
      if (!teacher) {
        throw new NotFoundException(sysMsg.TEACHER_NOT_FOUND);
      }

      teacherDetails = this.mapTeacherToDetailsDto(teacher);
    }

    // Fetch active academic session
    const academicSession = await this.getActiveSession();

    // Normalize arm: treat undefined, null, and empty string as equivalent
    const normalizedArm = arm || '';

    // Use transaction to ensure atomicity between check and create
    return this.dataSource.transaction(async (manager) => {
      const { payload } = await this.classModelAction.find({
        findOptions: {
          name,
          arm: normalizedArm,
          academicSession: { id: academicSession.id },
          is_deleted: false,
        },
        transactionOptions: {
          useTransaction: true,
          transaction: manager,
        },
      });
      if (payload.length > 0) {
        throw new ConflictException(sysMsg.CLASS_ALREADY_EXIST);
      }

      // Create class with optional teacher
      const createdClass = await this.classModelAction.create({
        createPayload: {
          name,
          arm: normalizedArm,
          academicSession,
          ...(teacherId && { teacher: { id: teacherId } }),
        },
        transactionOptions: {
          useTransaction: true,
          transaction: manager,
        },
      });

      this.logger.info(sysMsg.CLASS_CREATED, createdClass);

      return {
        message: sysMsg.CLASS_CREATED,
        id: createdClass.id,
        name: createdClass.name,
        arm: createdClass.arm,
        academicSession: {
          id: academicSession.id,
          name: academicSession.name,
        },
        teacher: teacherDetails,
      };
    });
  }

  /**
   * Fetches the active academic session entity.
   */
  private async getActiveSession(): Promise<AcademicSession> {
    const { payload } = await this.academicSessionModelAction.list({
      filterRecordOptions: { status: SessionStatus.ACTIVE },
    });
    if (!payload.length) throw new NotFoundException('No active session found');
    if (payload.length > 1)
      throw new ConflictException('Multiple active sessions found');
    return payload[0];
  }

  /**
   * Updates the name, arm, and/or teacher of an existing class, ensuring uniqueness within the session.
   */
  async updateClass(
    classId: string,
    updateClassDto: UpdateClassDto,
  ): Promise<IUpdateClassResponse> {
    // 1. Fetch class by ID
    const existingClass = await this.classModelAction.get({
      identifierOptions: { id: classId },
      relations: { academicSession: true, teacher: { user: true } },
    });
    if (!existingClass || existingClass.is_deleted) {
      throw new NotFoundException(sysMsg.CLASS_NOT_FOUND);
    }

    // 2. Prepare new values
    const { name, arm, teacherIds } = updateClassDto;

    const newName = name ?? existingClass.name;
    // Normalize arm: treat undefined, null, and empty string as equivalent
    const newArm = (arm ?? existingClass.arm) || '';
    const sessionId = existingClass.academicSession.id;

    // Prevent empty class name
    if (name !== undefined && (!newName || newName.trim() === '')) {
      throw new BadRequestException(sysMsg.CLASS_NAME_EMPTY);
    }

    // Use transaction to ensure atomicity
    return this.dataSource.transaction(async (manager) => {
      // 3. Check uniqueness
      const { payload } = await this.classModelAction.find({
        findOptions: {
          name: newName,
          arm: newArm,
          academicSession: { id: sessionId },
          is_deleted: false,
        },
        transactionOptions: { useTransaction: true, transaction: manager },
      });
      if (payload.length > 0 && payload[0].id !== classId) {
        throw new ConflictException(sysMsg.CLASS_ALREADY_EXIST);
      }

      // 4. Handle teacher assignment logic
      let teacherDetails = null;
      const updatePayload: Partial<{
        name: string;
        arm: string;
        teacher: { id: string } | null;
      }> = { name: newName, arm: newArm };

      if (teacherIds !== undefined) {
        if (teacherIds.length > 0) {
          // Assign new teacher
          const teacherId = teacherIds[0];
          const teacher = await this.teacherModelAction.get({
            identifierOptions: { id: teacherId },
            relations: { user: true },
          });
          if (!teacher) {
            throw new NotFoundException(sysMsg.TEACHER_NOT_FOUND);
          }

          updatePayload.teacher = { id: teacherId };
          teacherDetails = this.mapTeacherToDetailsDto(teacher);
        } else {
          // Empty array = remove teacher
          updatePayload.teacher = null;
          teacherDetails = null;
        }
      } else {
        // Field not provided = keep existing teacher
        teacherDetails = this.mapTeacherToDetailsDto(existingClass.teacher);
      }

      // 5. Update class
      await this.classModelAction.update({
        identifierOptions: { id: classId },
        updatePayload,
        transactionOptions: { useTransaction: true, transaction: manager },
      });

      // 6. Return response
      return {
        message: sysMsg.CLASS_UPDATED,
        id: classId,
        name: newName,
        arm: newArm,
        academicSession: {
          id: sessionId,
          name: existingClass.academicSession.name,
        },
        teacher: teacherDetails,
      };
    });
  }

  /**
   * Fetches all classes grouped by name and academic session, including arm.
   */
  async getGroupedClasses(page = 1, limit = 20) {
    // Use generic list method from AbstractModelAction
    const { payload: classesRaw, paginationMeta } =
      await this.classModelAction.list({
        filterRecordOptions: { is_deleted: false },
        relations: { academicSession: true, teacher: { user: true } },
        order: { name: 'ASC', arm: 'ASC' },
        paginationPayload: { page, limit },
      });

    const classes = Array.isArray(classesRaw) ? classesRaw : [];

    const grouped: Record<
      string,
      {
        name: string;
        academicSession: { id: string; name: string };
        classes: {
          id: string;
          arm?: string;
          teacher: { id: string; name: string; employment_id: string } | null;
        }[];
      }
    > = {};

    for (const cls of classes) {
      const key = `${cls.name}_${cls.academicSession.id}`;
      if (!grouped[key]) {
        grouped[key] = {
          name: cls.name,
          academicSession: {
            id: cls.academicSession.id,
            name: cls.academicSession.name,
          },
          classes: [],
        };
      }

      const teacherDetails = this.mapTeacherToDetailsDto(cls.teacher);

      grouped[key].classes.push({
        id: cls.id,
        arm: cls.arm,
        teacher: teacherDetails,
      });
    }

    return {
      message: sysMsg.CLASS_FETCHED,
      items: Object.values(grouped),
      pagination: paginationMeta,
    };
  }

  /**
   * Fetches a class by its ID.
   */
  async getClassById(classId: string): Promise<IGetClassByIdResponse> {
    const classEntity = await this.classModelAction.get({
      identifierOptions: { id: classId },
      relations: { academicSession: true, teacher: { user: true } },
    });
    if (!classEntity) {
      throw new NotFoundException(sysMsg.CLASS_NOT_FOUND);
    }

    const teacherDetails = this.mapTeacherToDetailsDto(classEntity.teacher);

    return {
      message: sysMsg.CLASS_FETCHED,
      id: classEntity.id,
      name: classEntity.name,
      arm: classEntity.arm,
      is_deleted: classEntity.is_deleted,
      academicSession: {
        id: classEntity.academicSession.id,
        name: classEntity.academicSession.name,
      },
      teacher: teacherDetails,
    };
  }

  /**
   * Fetches Total Number of Classes in the System.
   */
  async getTotalClasses(
    sessionId: string,
    name?: string,
    arm?: string,
  ): Promise<{ message: string; total: number }> {
    const filter: Record<string, unknown> = {
      academicSession: { id: sessionId },
    };
    if (name) filter.name = name;
    if (arm) filter.arm = arm;

    const { paginationMeta } = await this.classModelAction.list({
      filterRecordOptions: filter,
      paginationPayload: { page: 1, limit: 1 },
    });
    return {
      message: sysMsg.TOTAL_CLASSES_FETCHED,
      total: paginationMeta.total,
    };
  }

  /**
   * Soft deletes a class by ID.
   * Only allows deletion of classes from the active session.
   */
  async deleteClass(classId: string) {
    const classEntity = await this.classModelAction.get({
      identifierOptions: { id: classId },
      relations: { academicSession: true },
    });

    if (!classEntity || classEntity.is_deleted) {
      throw new NotFoundException(sysMsg.CLASS_NOT_FOUND);
    }

    // Get active session
    const activeSession = await this.getActiveSession();

    // Check if class belongs to active session
    if (classEntity.academicSession.id !== activeSession.id) {
      throw new BadRequestException(sysMsg.CANNOT_DELETE_PAST_SESSION_CLASS);
    }

    // Perform soft delete
    await this.classModelAction.update({
      identifierOptions: { id: classId },
      updatePayload: {
        is_deleted: true,
        deleted_at: new Date(),
      },
      transactionOptions: { useTransaction: false },
    });

    return {
      status_code: HttpStatus.OK,
      message: sysMsg.CLASS_DELETED,
    };
  }

  /**
   * Assigns multiple students to a class.
   * Uses the class's academic session automatically.
   */
  async assignStudentsToClass(
    classId: string,
    assignStudentsDto: AssignStudentsToClassDto,
  ): Promise<{
    message: string;
    assigned: number;
    skipped: number;
    classId: string;
  }> {
    // 1. Validate class exists and get its academic session
    const classExist = await this.classModelAction.get({
      identifierOptions: { id: classId },
      relations: { academicSession: true },
    });
    if (!classExist) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }

    // 2. Use the class's academic session (classes are always tied to a session)
    const sessionId = classExist.academicSession.id;

    // 3. Validate all student IDs exist
    const { studentIds } = assignStudentsDto;
    for (const studentId of studentIds) {
      const student = await this.studentModelAction.get({
        identifierOptions: { id: studentId },
      });
      if (!student) {
        throw new NotFoundException(`Student with ID ${studentId} not found`);
      }
    }

    // 4. Check for existing assignments and assign in transaction
    let assignedCount = 0;
    let skippedCount = 0;
    await this.dataSource.transaction(async (manager) => {
      for (const studentId of studentIds) {
        // Check if assignment already exists using repository through transaction manager
        const existingAssignment = await manager.findOne(ClassStudent, {
          where: {
            class: { id: classId },
            student: { id: studentId },
            session_id: sessionId,
            is_active: true,
          },
        });

        if (!existingAssignment) {
          // Create new assignment
          await this.classStudentModelAction.create({
            createPayload: {
              class: { id: classId },
              student: { id: studentId },
              session_id: sessionId,
              is_active: true,
              enrollment_date: new Date(),
            },
            transactionOptions: {
              useTransaction: true,
              transaction: manager,
            },
          });
          assignedCount++;
        } else {
          skippedCount++;
        }
      }
    });

    this.logger.info(
      `Assigned ${assignedCount} students, skipped ${skippedCount} (already assigned) to class ${classId}`,
      {
        classId,
        studentIds,
        sessionId,
        assignedCount,
        skippedCount,
      },
    );

    // Build appropriate message based on results
    let message = '';
    if (assignedCount > 0 && skippedCount > 0) {
      message = `Successfully assigned ${assignedCount} student(s) to class. ${skippedCount} student(s) were already assigned and skipped.`;
    } else if (assignedCount > 0) {
      message = `Successfully assigned ${assignedCount} student(s) to class.`;
    } else if (skippedCount > 0) {
      message = `All ${skippedCount} student(s) were already assigned to this class. No new assignments made.`;
    } else {
      message = `No students were assigned.`;
    }

    return {
      message,
      assigned: assignedCount,
      skipped: skippedCount,
      classId,
    };
  }

  /**
   * Fetches students for a specific class.
   * Uses the class's academic session automatically.
   */
  async getStudentsByClass(
    classId: string,
    sessionId?: string,
  ): Promise<StudentAssignmentResponseDto[]> {
    // 1. Validate class exists and get its academic session
    const classExist = await this.classModelAction.get({
      identifierOptions: { id: classId },
      relations: { academicSession: true },
    });
    if (!classExist) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }

    // 2. Use the class's academic session (or provided sessionId for filtering)
    const target_session_id = sessionId || classExist.academicSession.id;

    // 3. Fetch Assignments with Relations
    const assignments = await this.classStudentModelAction.list({
      filterRecordOptions: {
        class: { id: classId },
        session_id: target_session_id,
        is_active: true,
      },
      relations: {
        student: { user: true },
      },
    });

    // 4. Map to DTO
    return assignments.payload.map((assignment) => {
      const student = assignment.student;
      const user = student.user;
      const fullName = user
        ? `${user.first_name} ${user.last_name}`
        : `Student ${student.registration_number}`;
      return {
        student_id: student.id,
        registration_number: student.registration_number,
        name: fullName,
        enrollment_date: assignment.enrollment_date,
        is_active: assignment.is_active,
      };
    });
  }

  /**
   * Fetches classes assigned to a specific teacher as form teacher.
   * Optionally filters by session ID, defaults to active session.
   */
  async getClassesByTeacher(
    teacherId: string,
    sessionId?: string,
  ): Promise<ClassResponseDto[]> {
    // Handle Session Logic (Default to active if null)
    const target_session = sessionId || (await this.getActiveSession());
    const target_session_id =
      typeof target_session === 'string' ? target_session : target_session.id;

    // Fetch classes directly assigned to this teacher
    const { payload: classes } = await this.classModelAction.list({
      filterRecordOptions: {
        teacher: { id: teacherId },
        academicSession: { id: target_session_id },
        is_deleted: false,
      },
      relations: {
        academicSession: true,
      },
    });

    // Map to DTO
    return classes.map((classEntity) => ({
      id: classEntity.id,
      name: classEntity.name,
      arm: classEntity.arm,
      academicSession: {
        id: classEntity.academicSession.id,
        name: classEntity.academicSession.name,
      },
    }));
  }
}
