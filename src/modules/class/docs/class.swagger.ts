import { ClassResponseDto } from '../dto/create-class.dto';
import { TeacherAssignmentResponseDto } from '../dto/teacher-response.dto';

/**
 * Swagger documentation for Class endpoints.
 *
 * @module Class
 */

export const ClassSwagger = {
  tags: ['Class'],
  summary: 'Class Management',
  description:
    'Endpoints for managing classes and retrieving class information.',
  endpoints: {
    createClass: {
      operation: {
        summary: 'Create a new class (ADMIN)',
        description: 'Admin creates a new class with name and level/category.',
      },
      body: {
        description:
          'Class creation payload. Requires academic_session_id (UUID of an existing academic session). Optionally, provide an array of stream UUIDs to associate with the class.',
        type: 'CreateClassDto',
        examples: {
          valid: {
            summary: 'Valid payload with streams',
            value: {
              class_name: 'JSS2',
              level: 'Junior Secondary',
              academic_session_id: 'c438779a-514a-47e1-9596-b21e0bf87334',
              streams: [
                'b1a2c3d4-5678-1234-9876-abcdefabcdef',
                'e2f3a4b5-6789-2345-8765-fedcbafedcba',
              ],
            },
          },
          validNoStreams: {
            summary: 'Valid payload without streams',
            value: {
              class_name: 'JSS2',
              level: 'Junior Secondary',
              academic_session_id: 'c438779a-514a-47e1-9596-b21e0bf87334',
            },
          },
          invalid: {
            summary: 'Invalid payload (empty name)',
            value: {
              class_name: '',
              level: 'Primary',
              academic_session_id: '',
              streams: ['not-a-uuid'],
            },
          },
        },
      },
      responses: {
        created: {
          status: 201,
          description: 'Class created successfully.',
          type: ClassResponseDto,
          example: {
            id: 'a1b2c3d4-5678-1234-9876-abcdefabcdef',
            name: 'JSS2',
            level: 'Junior Secondary',
            academicSession: {
              id: 'c438779a-514a-47e1-9596-b21e0bf87334',
              name: '2024-2025',
            },
            streams: [
              { id: 'b1a2c3d4-5678-1234-9876-abcdefabcdef', name: 'Science' },
              { id: 'e2f3a4b5-6789-2345-8765-fedcbafedcba', name: 'Arts' },
            ],
          },
        },
        badRequest: {
          status: 400,
          description: 'Validation error.',
        },
      },
    },
    getTeachers: {
      operation: {
        summary: 'Get teachers assigned to a class',
        description:
          'Returns a list of teachers assigned to a specific class ID. Filters by session if provided, otherwise uses current session.',
      },
      parameters: {
        id: {
          name: 'id',
          description: 'The Class ID',
          type: String,
        },
      },
      responses: {
        ok: {
          description: 'List of assigned teachers',
          type: TeacherAssignmentResponseDto,
          isArray: true,
        },
        notFound: {
          description: 'Class not found',
        },
        internalServerError: {
          description: 'Database connection failure.',
        },
      },
    },
  },
};
