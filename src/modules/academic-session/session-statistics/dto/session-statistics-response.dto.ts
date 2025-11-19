import { ApiProperty } from '@nestjs/swagger';

import { SessionStatus } from '../../entities/academic-session.entity';

export class SessionStatisticsResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  sessionId: string;

  @ApiProperty({ example: '2024/2025 Academic Session' })
  sessionName: string;

  @ApiProperty({ example: '2024-09-01' })
  startDate: Date;

  @ApiProperty({ example: '2025-07-31' })
  endDate: Date;

  @ApiProperty({ enum: SessionStatus, example: SessionStatus.ACTIVE })
  status: SessionStatus;

  @ApiProperty({ example: 15, description: 'Total classes in session' })
  totalClasses: number;

  @ApiProperty({ example: 45, description: 'Total streams in session' })
  totalStreams: number;

  @ApiProperty({ example: 1250, description: 'Total students enrolled' })
  totalStudents: number;

  @ApiProperty({ example: 65, description: 'Total teachers assigned' })
  totalTeachers: number;

  @ApiProperty({ example: '2024-09-15T10:30:00.000Z' })
  generatedAt: Date;
}
