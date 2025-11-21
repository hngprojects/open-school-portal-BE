import {
  ConflictException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import * as sysMsg from '../../constants/system.messages';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    activateUserAccount: jest.fn(),
    deactivateUserAccount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('activateAccount', () => {
    it('should activate a user account and return a success message', async () => {
      const userId = 'some-uuid';
      const successMessage = sysMsg.USER_ACTIVATED;

      mockAuthService.activateUserAccount.mockResolvedValue(successMessage);

      const result = await controller.activateAccount(userId);

      expect(authService.activateUserAccount).toHaveBeenCalledWith(userId);
      expect(result).toEqual({
        status: HttpStatus.OK,
        message: successMessage,
      });
    });

    it('should return a message indicating the user is already active', async () => {
      const userId = 'some-uuid';
      const successMessage = sysMsg.USER_IS_ACTIVATED;

      mockAuthService.activateUserAccount.mockResolvedValue(successMessage);

      const result = await controller.activateAccount(userId);

      expect(authService.activateUserAccount).toHaveBeenCalledWith(userId);
      expect(result).toEqual({
        status: HttpStatus.OK,
        message: successMessage,
      });
    });

    it('should throw a NotFoundException if user does not exist', async () => {
      const userId = 'non-existent-uuid';

      mockAuthService.activateUserAccount.mockRejectedValue(
        new NotFoundException(sysMsg.USER_NOT_FOUND),
      );

      await expect(controller.activateAccount(userId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.activateAccount(userId)).rejects.toThrow(
        sysMsg.USER_NOT_FOUND,
      );
    });
  });

  describe('deactivateAccount', () => {
    it('should deactivate a user account and return a success response', async () => {
      const userId = 'an-active-user-uuid';
      const successResponse = { message: sysMsg.USER_DEACTIVATED };

      mockAuthService.deactivateUserAccount.mockResolvedValue(successResponse);

      const result = await controller.deactivateAccount(userId);

      expect(authService.deactivateUserAccount).toHaveBeenCalledWith(userId);
      expect(result).toEqual(successResponse);
    });

    it('should throw ConflictException when user is already deactivated', async () => {
      const userId = 'a-deactivated-user-uuid';

      mockAuthService.deactivateUserAccount.mockRejectedValue(
        new ConflictException(sysMsg.USER_IS_DEACTIVATED),
      );

      await expect(controller.deactivateAccount(userId)).rejects.toThrow(
        new ConflictException(sysMsg.USER_IS_DEACTIVATED),
      );
    });

    it('should throw a NotFoundException if user does not exist', async () => {
      const userId = 'a-non-existent-user-uuid';

      mockAuthService.deactivateUserAccount.mockRejectedValue(
        new NotFoundException(sysMsg.USER_NOT_FOUND),
      );

      await expect(controller.deactivateAccount(userId)).rejects.toThrow(
        new NotFoundException(sysMsg.USER_NOT_FOUND),
      );
    });
  });
});
