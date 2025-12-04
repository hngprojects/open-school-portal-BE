import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { SkipWrap } from '../../../common/decorators/skip-wrap.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { UserRole } from '../../shared/enums';
import { DocsGetClassResults } from '../docs/result.decorator';
import { GenerateResultDto, ResultResponseDto } from '../dto';
import { ResultService } from '../services/result.service';

@ApiTags('Results')
@ApiBearerAuth()
@Controller('results')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ResultController {
  constructor(private readonly resultService: ResultService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate results for students' })
  @ApiResponse({
    status: 201,
    description: 'Results generated successfully',
  })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async generateResults(@Body() generateDto: GenerateResultDto) {
    return this.resultService.generateClassResults(
      generateDto.class_id,
      generateDto.term_id,
      generateDto.academic_session_id,
    );
  }

  @Get('class/:classId')
  @DocsGetClassResults()
  @SkipWrap()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async getClassResults(
    @Param('classId', ParseUUIDPipe) classId: string,
    @Query('term_id', ParseUUIDPipe) termId: string,
    @Query('academic_session_id', new ParseUUIDPipe({ optional: true }))
    academicSessionId?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
  ) {
    return this.resultService.getClassResults(
      classId,
      termId,
      academicSessionId,
      page,
      limit,
    );
  }

  @Get(':resultId')
  @ApiOperation({ summary: 'Get a specific result by ID' })
  @ApiResponse({
    status: 200,
    description: 'Result retrieved successfully',
    type: ResultResponseDto,
  })
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT)
  async getResultById(
    @Param('resultId', ParseUUIDPipe) resultId: string,
  ): Promise<ResultResponseDto> {
    return this.resultService.getResultById(resultId);
  }
}
