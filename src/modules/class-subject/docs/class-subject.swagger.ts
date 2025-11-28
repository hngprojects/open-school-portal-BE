import { HttpStatus } from '@nestjs/common';

import * as sysMsg from '../../../constants/system.messages';
import { ClassSubjectResponseDto } from '../dto/class-subject-response.dto';

/**
 * Swagger documentation for Class-Subject endpoints.
 *
 * @module Class-Subject
 */

export const ClassSubjectSwagger = {
  tags: ['Class Subjects'],
  summary: 'Class Subject Management',
  description:
    'Endpoints for assigning subjects to classes, removing subject assignments, and retrieving class-subject relationships.',
  endpoints: {
    assignSubjectToClass: {
      operation: {
        summary: 'Assign a subject to a class by name',
        description:
          'Assigns a subject to a specific class using class name, arm, and subject name. Creates a new assignment record in the system.',
      },
      body: {
        class_name: {
          name: 'class_name',
          description: 'The name of the class (e.g., "SSS 2", "JSS 1")',
        },
        arm: {
          name: 'arm',
          description: 'The arm of the class (e.g., "A", "B", "C")',
        },
        subject_name: {
          name: 'subject_name',
          description:
            'The name of the subject to assign (e.g., "Mathematics", "English")',
        },
      },
      responses: {
        created: {
          status: HttpStatus.CREATED,
          description: sysMsg.SUBJECT_ASSIGNED_TO_CLASS,
          type: ClassSubjectResponseDto,
        },
        badRequest: {
          status: HttpStatus.BAD_REQUEST,
          description: sysMsg.SUBJECT_ALREADY_ASSIGNED_TO_CLASS,
        },
        notFound: {
          status: HttpStatus.NOT_FOUND,
          description: sysMsg.NOT_FOUND,
        },
      },
    },
    removeSubjectFromClass: {
      operation: {
        summary: 'Remove a subject assignment from a class',
        description:
          'Removes a subject assignment from a class using the assignment ID. Deletes the assignment record from the system.',
      },
      parameters: {
        assignmentId: {
          name: 'assignmentId',
          in: 'path',
          description: 'The ID of the class-subject assignment to remove',
        },
      },
      responses: {
        noContent: {
          status: HttpStatus.NO_CONTENT,
          description: sysMsg.SUBJECT_REMOVED_FROM_CLASS,
        },
        notFound: {
          status: HttpStatus.NOT_FOUND,
          description: sysMsg.NOT_FOUND,
        },
      },
    },
    getClassSubjects: {
      operation: {
        summary: 'Get all subjects assigned to a specific class',
        description:
          'Returns all subjects assigned to a specific class identified by name and arm. Useful for viewing the curriculum of a class.',
      },
      parameters: {
        className: {
          name: 'className',
          in: 'path',
          description: 'The name of the class (e.g., "SSS 2", "JSS 1")',
        },
        arm: {
          name: 'arm',
          in: 'path',
          description: 'The arm of the class (e.g., "A", "B", "C")',
        },
      },
      responses: {
        ok: {
          status: HttpStatus.OK,
          description: sysMsg.CLASS_SUBJECTS_RETRIEVED,
          type: ClassSubjectResponseDto,
          isArray: true,
        },
        notFound: {
          status: HttpStatus.NOT_FOUND,
          description: sysMsg.NOT_FOUND,
        },
      },
    },
    getSubjectClasses: {
      operation: {
        summary: 'Get all classes a specific subject is assigned to',
        description:
          'Returns all classes that have a specific subject assigned. Useful for viewing which classes teach a particular subject.',
      },
      parameters: {
        subjectName: {
          name: 'subjectName',
          in: 'path',
          description:
            'The name of the subject to search for (e.g., "Mathematics", "English")',
        },
      },
      responses: {
        ok: {
          status: HttpStatus.OK,
          description: sysMsg.SUBJECT_CLASSES_RETRIEVED,
          type: ClassSubjectResponseDto,
          isArray: true,
        },
        notFound: {
          status: HttpStatus.NOT_FOUND,
          description: sysMsg.NOT_FOUND,
        },
      },
    },
  },
};
