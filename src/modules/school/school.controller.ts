import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
} from '@nestjs/swagger';

import { IMulterFile } from '../../common/types/multer.types';
import { schoolLogoConfig } from '../../config/multer.config';

import { CreateInstallationDto } from './dto/create-installation.dto';
import { InstallationResponseDto } from './dto/installation-response.dto';
import { SchoolService } from './school.service';

@ApiTags('Installation')
@Controller('install')
export class SchoolController {
  constructor(private readonly schoolService: SchoolService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('logo', schoolLogoConfig))
  @ApiOperation({
    summary: 'Process school installation',
    description:
      'Creates school metadata including name, logo, and branding colors. Marks installation as completed.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'School installation completed successfully',
    type: InstallationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Installation already completed or school name already exists',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input or logo upload failed',
  })
  async install(
    @Body() createInstallationDto: CreateInstallationDto,
    @UploadedFile() logo?: IMulterFile,
  ): Promise<InstallationResponseDto> {
    return this.schoolService.processInstallation(createInstallationDto, logo);
  }
}
