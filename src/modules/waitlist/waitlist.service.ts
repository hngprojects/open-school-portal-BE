import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Repository } from 'typeorm';
import { Logger } from 'winston';

import {
  EmailTemplateID,
  EMAIL_PATTERN,
  EMAIL_SERVICE_NAME,
} from '../../constants/service-constants';
import * as sysMsg from '../../constants/system.messages';
import { EmailPayload } from '../email/email.types';

import { CreateWaitlistDto } from './dto/create-waitlist.dto';
import { UpdateWaitlistDto } from './dto/update-waitlist.dto';
import { Waitlist } from './entities/waitlist.entity';

@Injectable()
export class WaitlistService {
  private readonly logger: Logger;
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) baseLogger: Logger,
    @InjectRepository(Waitlist)
    private readonly waitlistRepository: Repository<Waitlist>,
    @Inject(EMAIL_SERVICE_NAME) private readonly emailClient: ClientProxy,
  ) {
    this.logger = baseLogger.child({ context: WaitlistService.name });
  }

  async create(createWaitlistDto: CreateWaitlistDto): Promise<Waitlist> {
    const existingEntry = await this.waitlistRepository.findOne({
      where: { email: createWaitlistDto.email },
    });

    if (existingEntry) {
      throw new ConflictException(sysMsg.EMAIL_ALREADY_EXISTS);
    }

    const waitlistEntry = this.waitlistRepository.create(createWaitlistDto);
    const savedEntry = await this.waitlistRepository.save(waitlistEntry);

    const emailPayload: EmailPayload = {
      to: [{ email: savedEntry.email, name: savedEntry.firstName }],
      subject: "You're on the Waitlist!",
      templateNameID: EmailTemplateID.WAITLIST_WELCOME,
      templateData: {
        firstName: savedEntry.firstName,
        schoolName: 'School Base',
      },
    };

    this.emailClient.emit(EMAIL_PATTERN, emailPayload);

    return savedEntry;
  }

  async findAll(): Promise<Waitlist[]> {
    return this.waitlistRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<Waitlist> {
    const entry = await this.waitlistRepository.findOne({
      where: { id },
    });

    if (!entry) {
      this.logger.warn('Waitlist entry not found', { id });
      throw new NotFoundException(`Waitlist entry with ID ${id} not found`);
    }

    return entry;
  }

  async update(
    id: string,
    updateWaitlistDto: UpdateWaitlistDto,
  ): Promise<Waitlist> {
    const entry = await this.findOne(id);

    if (updateWaitlistDto.email && updateWaitlistDto.email !== entry.email) {
      const existingEmail = await this.waitlistRepository.findOne({
        where: { email: updateWaitlistDto.email },
      });

      if (existingEmail) {
        throw new ConflictException(sysMsg.EMAIL_ALREADY_EXISTS);
      }
    }

    Object.assign(entry, updateWaitlistDto);
    return this.waitlistRepository.save(entry);
  }

  async remove(id: string): Promise<void> {
    const entry = await this.findOne(id);
    await this.waitlistRepository.remove(entry);
  }
}
