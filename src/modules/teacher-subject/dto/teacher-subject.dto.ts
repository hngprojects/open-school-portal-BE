import { PartialType } from '@nestjs/mapped-types';
import { IsUUID, IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateTeacherSubjectDto {
  @IsUUID()
  teacher_id: string;

  @IsUUID()
  subject_id: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateTeacherSubjectDto extends PartialType(
  CreateTeacherSubjectDto,
) {}
