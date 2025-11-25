import { HttpStatus } from '@nestjs/common';

import * as sysMsg from '../../../constants/system.messages';
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
      responses: {
        created: {
          status: HttpStatus.CREATED,
          description: sysMsg.WAITLIST_ADDED_SUCCESSFULLY,
          type: CreateWaitlistDto,
        },
        conflict: {
          status: HttpStatus.CONFLICT,
          description: sysMsg.EMAIL_ALREADY_EXISTS,
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
          status: HttpStatus.OK,
          description: sysMsg.WAITLIST_RETRIEVED_SUCCESSFULLY,
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
          description: sysMsg.WAITLIST_ID_PARAM,
        },
      },
      responses: {
        ok: {
          status: HttpStatus.OK,
          description: sysMsg.WAITLIST_RETRIEVED_SUCCESSFULLY,
          type: CreateWaitlistDto,
        },
        notFound: {
          status: HttpStatus.NOT_FOUND,
          description: 'Waitlist entry not found',
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
          description: sysMsg.WAITLIST_ID_PARAM,
        },
      },
      responses: {
        ok: {
          status: HttpStatus.OK,
          description: sysMsg.WAITLIST_REMOVED_SUCCESSFULLY,
        },
        notFound: {
          status: HttpStatus.NOT_FOUND,
          description: sysMsg.NOT_FOUND,
        },
      },
    },
  },
};
