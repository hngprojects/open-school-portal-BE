import { Controller, Post, Body, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { CreateStreamDto } from './dto/create-stream.dto';
import { StreamService } from './stream.service';

@ApiTags('Stream')
@Controller('stream')
export class StreamController {
  constructor(private readonly streamService: StreamService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new stream within a class' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Stream created successfully',
  })
  create(@Body() createStreamDto: CreateStreamDto) {
    return this.streamService.create(createStreamDto);
  }
}
