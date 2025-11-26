import * as sysMsg from '../../../constants/system.messages';
import { RoomResponseDto } from '../dto/room-response.dto';

/**
 * Swagger documentation for Room endpoints.
 *
 * @module Rooms
 */

export const RoomSwagger = {
  tags: ['Rooms'],
  summary: 'Room Management',
  description:
    'Endpoints for creating, retrieving, updating, and deleting rooms.',
  endpoints: {
    createRoom: {
      operation: {
        summary: 'Create a new room (Admin)',
        description:
          'Creates a new room with a unique name and optional capacity.',
      },
      responses: {
        created: {
          description: 'Room successfully created',
          type: RoomResponseDto,
        },
        badRequest: {
          description: sysMsg.BAD_REQUEST,
        },
        notFound: {
          description: sysMsg.NOT_FOUND,
        },
        conflict: {
          description: sysMsg.ROOM_ALREADY_EXISTS,
        },
      },
    },
  },
};
