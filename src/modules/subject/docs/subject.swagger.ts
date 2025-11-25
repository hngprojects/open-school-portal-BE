import { CreateSubjectDto } from '../dto/create-subject.dto';
import { SubjectResponseDto } from '../dto/subject-response.dto';
import { UpdateSubjectDto } from '../dto/update-subject.dto';

/**
 * Swagger documentation for Subject endpoints.
 *
 * @module Subject
 */

export const SubjectSwagger = {
  tags: ['Subject'],
  summary: 'Subject Management',
  description:
    'Endpoints for creating, retrieving, updating, and deleting subjects.',
  endpoints: {
    create: {
      summary: 'Create Subject',
      description:
        'Creates a new subject. Subject code must be unique. Subject must belong to at least one department.',
    },
    findAll: {
      summary: 'Get All Subjects',
      description:
        'Retrieves all subjects with pagination support. Defaults to page 1 and limit 20 if not provided.',
    },
    findOne: {
      summary: 'Get Subject by ID',
      description: 'Retrieves a single subject by its ID.',
    },
    update: {
      summary: 'Update Subject',
      description: 'Updates an existing subject.',
    },
    remove: {
      summary: 'Delete Subject',
      description: 'Deletes a subject by its ID.',
    },
  },
  decorators: {
    create: {
      operation: {
        summary: 'Create Subject',
        description:
          'Creates a new subject. Subject code must be unique. Subject must belong to at least one department.',
      },
      body: {
        type: CreateSubjectDto,
        description: 'Create subject payload',
        examples: {
          example1: {
            summary: 'Biology 101',
            value: {
              name: 'Biology',
              code: '101',
              departmentIds: ['550e8400-e29b-41d4-a716-446655440000'],
            },
          },
        },
      },
      response: {
        status: 201,
        description: 'Subject created successfully.',
        type: SubjectResponseDto,
      },
      errorResponses: [
        {
          status: 409,
          description: 'Subject with this code already exists.',
        },
        {
          status: 404,
          description: 'One or more departments not found.',
        },
        {
          status: 400,
          description: 'Invalid input data.',
        },
      ],
    },
    findAll: {
      operation: {
        summary: 'Get All Subjects',
        description:
          'Retrieves all subjects with pagination support. Defaults to page 1 and limit 20 if not provided.',
      },
      response: {
        status: 200,
        description: 'Paginated list of subjects.',
        type: SubjectResponseDto,
        isArray: true,
      },
    },
    findOne: {
      operation: {
        summary: 'Get Subject by ID',
        description: 'Retrieves a single subject by its ID.',
      },
      parameters: {
        id: {
          name: 'id',
          description: 'The Subject ID (UUID)',
          example: '550e8400-e29b-41d4-a716-446655440000',
        },
      },
      response: {
        status: 200,
        description: 'Subject details.',
        type: SubjectResponseDto,
      },
      errorResponses: [
        {
          status: 404,
          description: 'Subject not found.',
        },
      ],
    },
    update: {
      operation: {
        summary: 'Update Subject',
        description: 'Updates an existing subject.',
      },
      parameters: {
        id: {
          name: 'id',
          description: 'The Subject ID (UUID)',
          example: '550e8400-e29b-41d4-a716-446655440000',
        },
      },
      body: {
        type: UpdateSubjectDto,
        description: 'Update subject payload',
        examples: {
          example1: {
            summary: 'Update Subject Name and Departments',
            value: {
              name: 'Advanced Biology',
              departmentIds: [
                '550e8400-e29b-41d4-a716-446655440000',
                '660e8400-e29b-41d4-a716-446655440001',
              ],
            },
          },
        },
      },
      response: {
        status: 200,
        description: 'Subject updated successfully.',
        type: SubjectResponseDto,
      },
      errorResponses: [
        {
          status: 404,
          description: 'Subject or one or more departments not found.',
        },
        {
          status: 409,
          description: 'Subject with this code already exists.',
        },
        {
          status: 400,
          description: 'Invalid input data.',
        },
      ],
    },
    remove: {
      operation: {
        summary: 'Delete Subject',
        description: 'Deletes a subject by its ID.',
      },
      parameters: {
        id: {
          name: 'id',
          description: 'The Subject ID (UUID)',
          example: '550e8400-e29b-41d4-a716-446655440000',
        },
      },
      response: {
        status: 200,
        description: 'Subject deleted successfully.',
      },
      errorResponses: [
        {
          status: 404,
          description: 'Subject not found.',
        },
      ],
    },
  },
};
