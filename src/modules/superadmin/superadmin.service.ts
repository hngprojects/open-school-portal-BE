import { Injectable } from '@nestjs/common';

import { CreateSuperadminDto } from './dto/create-superadmin.dto';

@Injectable()
export class SuperadminService {
  createSuperAdmin(createSuperadminDto: CreateSuperadminDto) {
    /**
     * TODO:
     * 1. Ensures no other superadmin is available on the db with the same email AND having school name already attached to it
     *    - If that happens, throw 403 forbidden error
     *
     * 2.
     *
     * -- Note that what is coming from the DTO is full_name.
     * -- You must implement the enpoint to be called when
     *    the password setup link is clicked.
     */
    return createSuperadminDto;
  }

  activateAccount() {
    /**
     *
     */
  }
}
