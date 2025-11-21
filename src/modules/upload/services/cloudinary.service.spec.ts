import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { v2 as cloudinary } from 'cloudinary';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

import { IMulterFile } from '../../../common/types/multer.types';
import * as sysMsg from '../../../constants/system.messages';

import { CloudinaryService } from './cloudinary.service';

// Mock cloudinary
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn(),
      destroy: jest.fn(),
    },
  },
}));

describe('CloudinaryService', () => {
  let service: CloudinaryService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        cloudinaryCloudName: 'test-cloud',
        cloudinaryApiKey: 'test-api-key',
        cloudinaryApiSecret: 'test-api-secret',
      };
      // Map the key to the config object
      if (key === 'cloudinary.cloudName') return config.cloudinaryCloudName;
      if (key === 'cloudinary.apiKey') return config.cloudinaryApiKey;
      if (key === 'cloudinary.apiSecret') return config.cloudinaryApiSecret;
      return config[key];
    }),
  };

  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    child: jest.fn().mockReturnThis(),
  };

  const mockFile: IMulterFile = {
    fieldname: 'file',
    originalname: 'test-image.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 102400, // 100KB
    buffer: Buffer.from('fake-image-data'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudinaryService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<CloudinaryService>(CloudinaryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should initialize Cloudinary configuration', () => {
    expect(cloudinary.config).toHaveBeenCalledWith({
      cloud_name: 'test-cloud',
      api_key: 'test-api-key',
      api_secret: 'test-api-secret',
    });
  });

  describe('uploadImage', () => {
    it('should upload image successfully', async () => {
      const mockUploadResult = {
        secure_url:
          'https://res.cloudinary.com/test/image/upload/v1234567890/test-image.jpg',
        public_id: 'open-school-portal/test-image',
      };

      type UploadCallback = (
        error: Error | null,
        result: { secure_url: string; public_id: string } | null,
      ) => void;
      let uploadCallback: UploadCallback | undefined;
      const mockUploadStream = {
        end: jest.fn(() => {
          // Simulate successful upload by calling the callback
          if (uploadCallback) {
            uploadCallback(null, mockUploadResult);
          }
        }),
      };

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (
          options: unknown,
          callback: UploadCallback,
        ): { end: (buffer: Buffer) => void } => {
          uploadCallback = callback;
          return mockUploadStream;
        },
      );

      const result = await service.uploadImage(mockFile, 'test-folder');

      expect(cloudinary.uploader.upload_stream).toHaveBeenCalled();
      expect(mockUploadStream.end).toHaveBeenCalledWith(mockFile.buffer);
      expect(result).toEqual({
        url: mockUploadResult.secure_url,
        publicId: mockUploadResult.public_id,
      });
    });

    it('should throw BadRequestException when file is null', async () => {
      await expect(
        service.uploadImage(null as unknown as IMulterFile),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.uploadImage(null as unknown as IMulterFile),
      ).rejects.toThrow(sysMsg.FILE_REQUIRED);
    });

    it('should throw BadRequestException when file buffer is missing', async () => {
      const fileWithoutBuffer = { ...mockFile, buffer: undefined };
      await expect(
        service.uploadImage(fileWithoutBuffer as unknown as IMulterFile),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for unsupported file type', async () => {
      const invalidFile = { ...mockFile, mimetype: 'application/pdf' };
      await expect(service.uploadImage(invalidFile)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.uploadImage(invalidFile)).rejects.toThrow(
        sysMsg.UNSUPPORTED_FILE_TYPE,
      );
    });

    it('should throw BadRequestException for file too large', async () => {
      const largeFile = { ...mockFile, size: 6 * 1024 * 1024 }; // 6MB
      await expect(service.uploadImage(largeFile)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.uploadImage(largeFile)).rejects.toThrow(
        sysMsg.FILE_TOO_LARGE,
      );
    });

    it('should handle Cloudinary upload error', async () => {
      const mockError = new Error('Cloudinary upload failed');
      type UploadCallback = (
        error: Error | null,
        result: { secure_url: string; public_id: string } | null,
      ) => void;
      let uploadCallback: UploadCallback | undefined;
      const mockUploadStream = {
        end: jest.fn(() => {
          if (uploadCallback) {
            uploadCallback(mockError, null);
          }
        }),
      };

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (options: unknown, callback: UploadCallback): { end: () => void } => {
          uploadCallback = callback;
          return mockUploadStream;
        },
      );

      await expect(service.uploadImage(mockFile)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.uploadImage(mockFile)).rejects.toThrow(
        sysMsg.IMAGE_UPLOAD_FAILED,
      );
    });

    it('should accept valid image types', async () => {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      const mockUploadResult = {
        secure_url: 'https://res.cloudinary.com/test/image.jpg',
        public_id: 'test',
      };

      for (const mimetype of validTypes) {
        type UploadCallback = (
          error: Error | null,
          result: { secure_url: string; public_id: string } | null,
        ) => void;
        let uploadCallback: UploadCallback | undefined;
        const mockUploadStream = {
          end: jest.fn(() => {
            if (uploadCallback) {
              uploadCallback(null, mockUploadResult);
            }
          }),
        };

        (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
          (options: unknown, callback: UploadCallback): { end: () => void } => {
            uploadCallback = callback;
            return mockUploadStream;
          },
        );

        const file = { ...mockFile, mimetype };
        const result = await service.uploadImage(file);
        expect(result).toBeDefined();
        expect(result.url).toBe(mockUploadResult.secure_url);
      }
    });
  });

  describe('deleteImage', () => {
    it('should delete image successfully', async () => {
      (cloudinary.uploader.destroy as jest.Mock).mockResolvedValue({
        result: 'ok',
      });

      await service.deleteImage('test-public-id');

      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(
        'test-public-id',
      );
    });

    it('should throw BadRequestException when deletion fails', async () => {
      const error = new Error('Deletion failed');
      (cloudinary.uploader.destroy as jest.Mock).mockRejectedValue(error);

      await expect(service.deleteImage('test-public-id')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
