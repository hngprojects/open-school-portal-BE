import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';

import { ClassSubjectSwagger } from './class-subject.swagger';

export const DocsListClassSubjects = () => {
  const { operation, parameters, responses } =
    ClassSubjectSwagger.endpoints.list;

  return applyDecorators(
    ApiOperation(operation),
    ApiParam(parameters.id),
    ApiOkResponse(responses.ok),
    ApiNotFoundResponse(responses.notFound),
  );
};

export const DocsCreateClassSubjects = () => {
  const { operation, responses } = ClassSubjectSwagger.endpoints.create;

  return applyDecorators(
    ApiOperation(operation),
    ApiCreatedResponse(responses.created),
    ApiResponse(responses.badRequest),
    ApiNotFoundResponse(responses.notFound),
  );
};
