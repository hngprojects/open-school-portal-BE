import { CreateWaitlistDto } from '../dto/create-waitlist.dto';

/**
 * Swagger documentation for waitlist endpoints.
 *
 * @module Waitlist
 */

export const WaitlistSwagger = {
  tags: ['Waitlist'],
  summary: 'Waitlist Management',
  description: 'Endpoints for creating and managing waitlist entries.',
  endpoints: {
    createWaitlistEntry: {
      operation: {
        summary: 'Create a waitlist entry',
        description: 'Creates a new waitlist entry',
      },
      parameters: {
        first_name: {
          name: 'first_name',
          description: 'First Name',
        },
        last_name: {
          name: 'last_name',
          description: 'Last Name',
        },
        email: {
          name: 'email',
          description: 'Email',
        },
      },
      responses: {
        ok: {
          description: 'Add user to waitlist',
          type: CreateWaitlistDto,
          isArray: true,
        },
        duplicate: {
          description: 'email already exist',
        },
      },
    },
    getAllWaitlistEntries: {
      operation: {
        summary: 'Get all waitlist entries',
        description: 'Retrieves all waitlist entries',
      },
      responses: {
        ok: {
          description: 'Waitlist entries retrieved successfully',
          type: CreateWaitlistDto,
          isArray: true,
        },
      },
    },
    getWaitlistEntryById: {
      operation: {
        summary: 'Get specific waitlist entry',
        description: 'Retrieves a specific waitlist entry by ID',
      },
      parameters: {
        id: {
          name: 'id',
          description: 'Waitlist Entry ID',
        },
      },
      responses: {
        ok: {
          description: 'Waitlist entry retrieved successfully',
          type: CreateWaitlistDto,
        },
      },
    },
    deleteWaitlistEntry: {
      operation: {
        summary: 'Remove entry from waitlist',
        description: 'Deletes a waitlist entry by ID',
      },
      parameters: {
        id: {
          name: 'id',
          description: 'Waitlist Entry ID',
        },
      },
      responses: {
        ok: {
          description: 'Waitlist entry removed successfully',
        },
      },
    },
  },
};
