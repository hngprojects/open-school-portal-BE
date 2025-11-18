import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SYS_MSG } from '../../constants/system-messages';

import { CreateWaitlistDto } from './dto/create-waitlist.dto';
import { UpdateWaitlistDto } from './dto/update-waitlist.dto';
import { Waitlist } from './entities/waitlist.entity';

@Injectable()
export class WaitlistService {
  constructor(
    @InjectRepository(Waitlist)
    private readonly waitlistRepository: Repository<Waitlist>,
  ) {}

  async create(createWaitlistDto: CreateWaitlistDto): Promise<Waitlist> {
    const existingEntry = await this.waitlistRepository.findOne({
      where: { email: createWaitlistDto.email },
    });

    if (existingEntry) {
      throw new ConflictException(SYS_MSG.EMAIL_ALREADY_EXISTS);
    }

    const waitlistEntry = this.waitlistRepository.create(createWaitlistDto);
    const savedEntry = await this.waitlistRepository.save(waitlistEntry);
    await this.sendWaitlistEmail(savedEntry);

    return savedEntry;
  }

  async findAll(): Promise<Waitlist[]> {
    return await this.waitlistRepository.find({
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
        throw new ConflictException(SYS_MSG.EMAIL_ALREADY_EXISTS);
      }
    }

    Object.assign(entry, updateWaitlistDto);
    return await this.waitlistRepository.save(entry);
  }

  async remove(id: string): Promise<void> {
    const entry = await this.findOne(id);
    await this.waitlistRepository.remove(entry);
  }

  private async sendWaitlistEmail(entry: Waitlist): Promise<void> {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║           WAITLIST CONFIRMATION EMAIL                          ║
╚════════════════════════════════════════════════════════════════╝

To: ${entry.email}
Subject: Welcome to Open School Portal Waitlist! ���

Dear ${entry.firstName} ${entry.lastName},

Thank you for joining the Open School Portal waitlist!

We're excited to have you as one of our early supporters. You'll be 
among the first to know when we officially launch.

What happens next?
✓ You're now on our priority list
✓ You'll receive exclusive updates about our progress
✓ You'll get early access when we launch

We'll keep you posted on our journey!

Best regards,
The Open School Portal Team

════════════════════════════════════════════════════════════════

[Note: This is a console log. Real email will be sent in production]
    `);
  }
}
