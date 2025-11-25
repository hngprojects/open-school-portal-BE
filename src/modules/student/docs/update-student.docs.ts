import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

import { StudentSwagger } from './student.swagger';

export const UpdateStudentDocs = () => {
  const { operation, responses } = StudentSwagger.endpoints.update;

  return applyDecorators(
    ApiOperation(operation),
    ApiCreatedResponse(responses.created),
    ApiBadRequestResponse(responses.badRequest),
    ApiConflictResponse(responses.conflict),
    ApiNotFoundResponse(responses.notFound),
    ApiBearerAuth(),
  );
};
