import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
// import { UserRole } from '../../shared/enums';
import { InviteUserDto, InviteRole } from '../dto/invite-user.dto';
import { InvitesController } from '../invites.controller';
import { InviteService } from '../invites.service';

describe('InvitesController', () => {
  let controller: InvitesController;
  let service: InviteService;

  const mockInviteService = {
    sendInvite: jest.fn(),
    validateInviteToken: jest.fn(),
    getPendingInvites: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvitesController],
      providers: [
        {
          provide: InviteService,
          useValue: mockInviteService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<InvitesController>(InvitesController);
    service = module.get<InviteService>(InviteService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('inviteUser', () => {
    it('should call service.sendInvite with payload', async () => {
      const payload: InviteUserDto = {
        email: 'test@test.com',
        role: InviteRole.TEACHER,
        first_name: 'John',
        last_name: 'Doe',
      };

      const mockResponse = { status_code: 200, message: 'Sent', data: [] };
      mockInviteService.sendInvite.mockResolvedValue(mockResponse);

      const result = await controller.inviteUser(payload);

      expect(service.sendInvite).toHaveBeenCalledWith(payload);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getPendingInvites', () => {
    it('should call service.getPendingInvites', async () => {
      const mockResponse = { status_code: 200, message: 'Fetched', data: [] };
      mockInviteService.getPendingInvites.mockResolvedValue(mockResponse);

      const result = await controller.getPendingInvites();

      expect(service.getPendingInvites).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });
});
