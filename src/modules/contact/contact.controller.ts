import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import * as sysMsg from '../../constants/system.messages';

import { ContactService } from './contact.service';
import { ContactResponseDto } from './dto/contact-response.dto';
import { CreateContactDto } from './dto/create-contact.dto';

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a contact inquiry' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: sysMsg.CONTACT_MESSAGE_SENT,
    type: ContactResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: sysMsg.VALIDATION_ERROR,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: sysMsg.OPERATION_FAILED,
  })
  create(@Body() createContactDto: CreateContactDto) {
    return this.contactService.create(createContactDto);
  }
}
