import * as sysMsg from '../../../constants/system.messages';
import { ClassSubjectResponseDto } from '../dto';

/**
 * Swagger documentation for Class Subject endpoints.
 *
 * @module Class
 */

export const ClassSubjectSwagger = {
  tags: ['Class Subjects'],
  summary: 'Class Subjects Management',
  description:
    'Endpoints for creating, retrieving, updating, and deleting class subjects.',
  endpoints: {
    list: {
      operation: {
        summary: 'Get subjects assigned to a class',
        description:
          'Returns a list of subjects assigned to a specific class ID.',
      },
      parameters: {
        classId: {
          name: 'classId',
          description: 'The Class ID',
        },
      },
      responses: {
        ok: {
          description: 'List of assigned subjects',
          type: ClassSubjectResponseDto,
          isArray: true,
        },
        notFound: {
          description: 'Class not found',
        },
      },
    },
    assignTeacherToClass: {
      operation: {
        summary: 'Assigns a Teacher to a Subject in a Class (Admin)',
        description: 'Assigns a teacher to a subject in a class.',
      },
      parameters: {
        classId: {
          name: 'classId',
          description: 'The Class ID',
        },
        subjectId: {
          name: 'subjectId',
          description: 'The Subject ID',
        },
      },
      responses: {
        ok: {
          description: sysMsg.TEACHER_ASSIGNED,
        },
        notFound: {
          description: sysMsg.CLASS_SUBJECT_NOT_FOUND,
        },
        conflict: {
          description: sysMsg.CLASS_SUBJECT_ALREADY_HAS_A_TEACHER,
        },
      },
    },
    unassignTeacherFromClass: {
      operation: {
        summary: 'Unassign a Teacher from a Subject in a Class (Admin)',
        description: 'Unassign a teacher from a subject in a class.',
      },
      parameters: {
        classId: {
          name: 'classId',
          description: 'The Class ID',
        },
        subjectId: {
          name: 'subjectId',
          description: 'The Subject ID',
        },
      },
      responses: {
        ok: {
          description: sysMsg.TEACHER_UNASSIGNED_FROM_SUBJECT,
        },
        notFound: {
          description: sysMsg.CLASS_SUBJECT_NOT_FOUND,
        },
        badRequest: {
          description: sysMsg.TEACHER_NOT_ASSIGNED_TO_SUBJECT,
        },
      },
    },
  },
};
