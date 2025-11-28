import * as sysMsg from '../../../constants/system.messages';
import {
  ClassSubjectResponseDto,
  CreateClassSubjectsResponseDto,
} from '../dto';

/**
 * Swagger documentation for Class endpoints.
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
        id: {
          name: 'id',
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
    create: {
      operation: {
        summary: 'Create class subjects from an array of subject ids (Admin)',
        description:
          'Creates an array of class subjects from an array of subject ids.',
      },
      responses: {
        created: {
          description: sysMsg.CLASS_SUBJECTS_CREATED(1),
          type: CreateClassSubjectsResponseDto,
        },
        badRequest: {
          description:
            'Validation failed: incorrect class id or empty subject ids.',
        },
        notFound: {
          description: sysMsg.SUBJECT_NOT_FOUND,
        },
      },
    },
  },
};
