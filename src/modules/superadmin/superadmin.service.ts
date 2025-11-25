import { ConflictException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';

import * as sysMsg from '../../constants/system.messages';

import { CreateSuperadminDto } from './dto/create-superadmin.dto';
import { SuperAdmin } from './entities/superadmin.entity';
import { SuperadminModelAction } from './model-actions/superadmin-actions';

@Injectable()
export class SuperadminService {
  constructor(
    @InjectRepository(SuperAdmin)
    // private readonly superAdminRepo: Repository<SuperAdmin>,
    private readonly superadminModelAction: SuperadminModelAction,
    private readonly dataSource: DataSource,
  ) {}

  async createSuperAdmin(createSuperadminDto: CreateSuperadminDto) {
    const { password, confirm_password, email, ...restData } =
      createSuperadminDto;

    if (!password || !confirm_password) {
      throw new ConflictException(sysMsg.SUPERADMIN_PASSWORDS_REQUIRED);
    }

    const existing = this.superadminModelAction.get({
      identifierOptions: { email: createSuperadminDto.email },
    });

    if (existing) {
      throw new ConflictException(sysMsg.SUPERADMIN_EMAIL_EXISTS);
    }

    const passwordHash: string = await bcrypt.hash(password, 10);

    const createdSuperadmin = await this.dataSource.transaction(
      async (manager) => {
        const newSuperadmin = await this.superadminModelAction.create({
          createPayload: {
            ...restData,
            email,
            password: passwordHash,
            isActive: createSuperadminDto.schoolName ? true : false,
          },
          transactionOptions: { useTransaction: true, transaction: manager },
        });
        return newSuperadmin;
      },
    );

    if (createdSuperadmin.password) delete createdSuperadmin.password;

    return {
      message: sysMsg.SUPERADMIN_ACCOUNT_CREATED,
      status_code: HttpStatus.CREATED,
      data: createdSuperadmin,
    };
  }

  // Other methods go here...
}
