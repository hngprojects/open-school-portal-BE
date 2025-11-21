import { Readable } from 'stream';

import { BadRequestException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';

import * as sysMsg from '../../constants/system.messages';

import { UploadPictureResponseDto } from './dto';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

interface IRequestWithUser extends Request {
  user?: {
    userId?: string;
    email?: string;
    roles?: string[];
  };
}

describe('UploadController', () => {
  let controller: UploadController;
  let uploadService: UploadService;

  const mockUploadService = {
    uploadPicture: jest.fn(),
  };

  const mockFile: Express.Multer.File = {
    fieldname: 'file',
    originalname: 'test-image.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 102400, // 100KB
    buffer: Buffer.from('fake-image-data'),
    destination: '',
    filename: '',
    path: '',
    stream: null as unknown as Readable,
  };

  const mockUploadResponse: UploadPictureResponseDto = {
    url: 'https://res.cloudinary.com/test/image/upload/v1234567890/test-image.jpg',
    publicId: 'open-school-portal/test-image',
    originalName: 'test-image.jpg',
    size: 102400,
    mimetype: 'image/jpeg',
  };

  const mockRequest = {
    user: {
      userId: 'user-uuid-123',
      email: 'test@example.com',
      roles: ['STUDENT'],
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [
        {
          provide: UploadService,
          useValue: mockUploadService,
        },
      ],
    }).compile();

    controller = module.get<UploadController>(UploadController);
    uploadService = module.get<UploadService>(UploadService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadPicture', () => {
    it('should upload a picture successfully', async () => {
      mockUploadService.uploadPicture.mockResolvedValue(mockUploadResponse);

      const result = await controller.uploadPicture(
        mockFile,
        mockRequest as IRequestWithUser,
      );

      expect(uploadService.uploadPicture).toHaveBeenCalledWith(
        mockFile,
        'user-uuid-123',
      );
      expect(result).toEqual({
        status_code: HttpStatus.OK,
        message: sysMsg.IMAGE_UPLOAD_SUCCESS,
        data: mockUploadResponse,
      });
    });

    it('should upload a picture without userId if user is not in request', async () => {
      const requestWithoutUser = {} as IRequestWithUser;
      mockUploadService.uploadPicture.mockResolvedValue(mockUploadResponse);

      const result = await controller.uploadPicture(
        mockFile,
        requestWithoutUser,
      );

      expect(uploadService.uploadPicture).toHaveBeenCalledWith(
        mockFile,
        undefined,
      );
      expect(result).toEqual({
        status_code: HttpStatus.OK,
        message: sysMsg.IMAGE_UPLOAD_SUCCESS,
        data: mockUploadResponse,
      });
    });

    it('should throw BadRequestException when file is invalid', async () => {
      const error = new BadRequestException(sysMsg.FILE_REQUIRED);
      mockUploadService.uploadPicture.mockRejectedValue(error);

      await expect(
        controller.uploadPicture(mockFile, mockRequest as IRequestWithUser),
      ).rejects.toThrow(BadRequestException);
      expect(uploadService.uploadPicture).toHaveBeenCalledWith(
        mockFile,
        'user-uuid-123',
      );
    });

    it('should throw BadRequestException when file type is unsupported', async () => {
      const error = new BadRequestException(sysMsg.UNSUPPORTED_FILE_TYPE);
      mockUploadService.uploadPicture.mockRejectedValue(error);

      await expect(
        controller.uploadPicture(mockFile, mockRequest as IRequestWithUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when file is too large', async () => {
      const error = new BadRequestException(sysMsg.FILE_TOO_LARGE);
      mockUploadService.uploadPicture.mockRejectedValue(error);

      await expect(
        controller.uploadPicture(mockFile, mockRequest as IRequestWithUser),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
