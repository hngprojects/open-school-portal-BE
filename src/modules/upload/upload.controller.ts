import {
  Controller,
  Post,
  UseGuards,
  UploadedFile,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { Request } from 'express';

import { IMulterFile } from '../../common/types/multer.types';
import * as sysMsg from '../../constants/system.messages';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import {
  UploadControllerDecorators,
  UploadPictureDecorators,
} from './decorators/upload.decorators';
import { UploadPictureResponseDto } from './dto';
import { UploadService } from './upload.service';

interface IRequestWithUser extends Request {
  user?: {
    userId?: string;
    email?: string;
    roles?: string[];
  };
}

@Controller('upload')
@UseGuards(JwtAuthGuard)
@UploadControllerDecorators()
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('picture')
  @UploadPictureDecorators()
  async uploadPicture(
    @UploadedFile() file: IMulterFile,
    @Req() req: IRequestWithUser,
  ): Promise<{
    status_code: number;
    message: string;
    data: UploadPictureResponseDto;
  }> {
    const userId = req.user?.userId;

    const result = await this.uploadService.uploadPicture(file, userId);

    return {
      status_code: HttpStatus.OK,
      message: sysMsg.IMAGE_UPLOAD_SUCCESS,
      data: result,
    };
  }
}
