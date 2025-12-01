import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';

import { WaitlistSwagger } from './waitlist.swagger';

export const DocsCreateWaitlistEntry = () => {
  const { operation, responses } =
    WaitlistSwagger.endpoints.createWaitlistEntry;

  return applyDecorators(
    ApiOperation(operation),
    ApiCreatedResponse(responses.created),
    ApiNotFoundResponse(responses.conflict),
  );
};

export const DocsGetAllEntries = () => {
  const { operation, responses } =
    WaitlistSwagger.endpoints.getAllWaitlistEntries;

  return applyDecorators(ApiOperation(operation), ApiOkResponse(responses.ok));
};

export const DocsGetWaitlistEntryById = () => {
  const { operation, parameters, responses } =
    WaitlistSwagger.endpoints.getWaitlistEntryById;

  return applyDecorators(
    ApiOperation(operation),
    ApiParam(parameters.id),
    ApiOkResponse(responses.ok),
    ApiNotFoundResponse(responses.notFound),
  );
};

export const DocsDeleteWaitlistEntry = () => {
  const { operation, parameters, responses } =
    WaitlistSwagger.endpoints.deleteWaitlistEntry;

  return applyDecorators(
    ApiOperation(operation),
    ApiParam(parameters.id),
    ApiOkResponse(responses.ok),
    ApiNotFoundResponse(responses.notFound),
  );
};
