import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiNotFoundResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';

import { RoomSwagger } from './room.swagger';

export const DocsCreateRoom = () => {
  const { operation, responses } = RoomSwagger.endpoints.createRoom;

  return applyDecorators(
    ApiOperation(operation),
    ApiCreatedResponse(responses.created),
    ApiResponse(responses.badRequest),
    ApiNotFoundResponse(responses.notFound),
    ApiResponse(responses.conflict),
  );
};
