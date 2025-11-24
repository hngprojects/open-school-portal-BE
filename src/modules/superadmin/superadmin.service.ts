import { Injectable } from '@nestjs/common';

import { CreateSuperadminDto } from './dto/create-superadmin.dto';

@Injectable()
export class SuperadminService {
  /**
   * creates an instance of the superadmin - check the ./entity
   * @param createSuperadminDto 
   * @returns 
   */
  createSuperAdmin(createSuperadminDto: CreateSuperadminDto) {
    /**
     * Implementation goes here...
     */
    return createSuperadminDto;
  }
}
