import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';

import { ClassSubjectSwagger } from './class-subject.swagger';

export const DocsAssignSubjectToClass = () => {
  const { operation, responses } =
    ClassSubjectSwagger.endpoints.assignSubjectToClass;

  return applyDecorators(
    ApiOperation(operation),
    ApiCreatedResponse(responses.created),
    ApiResponse(responses.badRequest),
    ApiNotFoundResponse(responses.notFound),
  );
};

export const DocsRemoveSubjectFromClass = () => {
  const { operation, parameters, responses } =
    ClassSubjectSwagger.endpoints.removeSubjectFromClass;

  return applyDecorators(
    ApiOperation(operation),
    ApiParam(parameters.assignmentId),
    ApiNoContentResponse(responses.noContent),
    ApiNotFoundResponse(responses.notFound),
  );
};

export const DocsGetClassSubjects = () => {
  const { operation, parameters, responses } =
    ClassSubjectSwagger.endpoints.getClassSubjects;

  return applyDecorators(
    ApiOperation(operation),
    ApiParam(parameters.className),
    ApiParam(parameters.arm),
    ApiOkResponse(responses.ok),
    ApiNotFoundResponse(responses.notFound),
  );
};

export const DocsGetSubjectClasses = () => {
  const { operation, parameters, responses } =
    ClassSubjectSwagger.endpoints.getSubjectClasses;

  return applyDecorators(
    ApiOperation(operation),
    ApiParam(parameters.subjectName),
    ApiOkResponse(responses.ok),
    ApiNotFoundResponse(responses.notFound),
  );
};

// export const DocsGetAllClassSubjectAssignments = () => {
//   const { operation, parameters, responses } =
//     ClassSubjectSwagger.endpoints.getAllClassSubjectAssignments;

//   return applyDecorators(
//     ApiOperation(operation),
//     ApiQuery(parameters.page),
//     ApiQuery(parameters.limit),
//     ApiOkResponse(responses.ok),
//   );
// };
