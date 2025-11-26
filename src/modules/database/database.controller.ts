import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { SetupGuard } from '../shared/guards/setup.guard';

import { DatabaseService } from './database.service';
import { CreateDatabaseDocs } from './docs/database.swagger';
import { ConfigureDatabaseDto } from './dto/configure-database.dto';

@Controller('database')
@ApiTags('Database')
@UseGuards(SetupGuard)
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}

  //===> save database config (Super Admin) <====
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @CreateDatabaseDocs() // <=== Swagger docs
  create(@Body() configureDatabaseDto: ConfigureDatabaseDto) {
    return this.databaseService.create(configureDatabaseDto);
  }
}
