import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Invite } from '../entities/invites.entity';
import { PendingInviteDto } from '../dtos/pending-invite.dto';
import { PendingInvitesResponseDto } from '../dtos/pending-invite.dto';
import {
  PENDING_INVITES_FETCHED,
  NO_PENDING_INVITES,
} from 'src/constants/system.messages';

@Injectable()
export class PendingInvitesService {
  constructor(
    @InjectRepository(Invite)
    private readonly inviteRepo: Repository<Invite>,
  ) {}

  async getPendingInvites(): Promise<PendingInvitesResponseDto> {
    const invites = await this.inviteRepo.find({
      where: { accepted: false },
      order: { createdAt: 'DESC' },
    });

    if (invites.length === 0) {
      return {
        status_code: HttpStatus.NOT_FOUND,
        message: NO_PENDING_INVITES,
        data: [],
      };
    }

    const mappedInvites: PendingInviteDto[] = invites.map((invite) => ({
      id: invite.id,
      email: invite.email,
      invited_at: invite.invitedAt,
    }));

    return {
      status_code: HttpStatus.OK,
      message: PENDING_INVITES_FETCHED,
      data: mappedInvites,
    };
  }
}
