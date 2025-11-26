import { ApiProperty } from '@nestjs/swagger';

import * as sysMsg from '../../../constants/system.messages';

export class SuperadminLogoutResponseDto {
  @ApiProperty({
    example: '204',
    nullable: false,
  })
  status_code: number;

  @ApiProperty({
    example: sysMsg.LOGOUT_SUCCESS,
    nullable: false,
  })
  message?: string;
}
