import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import * as sysMsg from '../../../constants/system.messages';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { UserRole } from '../../user/entities/user.entity';
import { CreateStreamDto } from '../dto/create-stream.dto';
import { StreamResponseDto } from '../dto/stream-response.dto';
import { StreamService } from '../services/stream.service';

export interface IBaseResponse<T> {
  status_code: number;
  message: string;
  data: T;
}

export interface IStreamCreatedData {
  id: string;
  name: string;
  class_id: string;
  created_at: Date;
  student_count: number;
}

@ApiTags('Stream')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('stream')
export class StreamController {
  constructor(private readonly streamService: StreamService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new stream within a class' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: sysMsg.STREAM_CREATED_SUCCESSFULLY,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: sysMsg.CLASS_NOT_FOUND,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: sysMsg.STREAM_ALREADY_EXISTS_IN_CLASS,
  })
  async create(
    @Body() createStreamDto: CreateStreamDto,
  ): Promise<IBaseResponse<IStreamCreatedData>> {
    const stream = await this.streamService.create(createStreamDto);

    return {
      status_code: HttpStatus.CREATED,
      message: sysMsg.STREAM_CREATED_SUCCESSFULLY,
      data: stream,
    };
  }

  @Get('class/:classId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get all streams for a specific class' })
  @ApiParam({
    name: 'classId',
    type: 'string',
    description: 'UUID of the class',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: sysMsg.STREAMS_RETRIEVED,
    type: [StreamResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: sysMsg.CLASS_NOT_FOUND,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  async getStreamsByClass(
    @Param('classId', new ParseUUIDPipe()) classId: string,
  ): Promise<IBaseResponse<StreamResponseDto[]>> {
    const streams = await this.streamService.getStreamsByClass(classId);

    return {
      status_code: HttpStatus.OK,
      message: sysMsg.STREAMS_RETRIEVED,
      data: streams,
    };
  }
}
