import { Expose } from 'class-transformer';

export class StudentSubjectResponseDto {
  @Expose()
  subject_name: string;

  @Expose()
  teacher_name: string;

  @Expose()
  teacher_email: string;
}
