import { ApiProperty } from '@nestjs/swagger';

export class InstallationResponseDto {
  @ApiProperty({
    description: 'School unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'School name',
    example: 'St. Mary International School',
  })
  school_name: string;

  @ApiProperty({
    description: 'School logo URL',
    example: 'https://example.com/uploads/schools/logo-123.png',
    required: false,
  })
  logo_url?: string;

  @ApiProperty({
    description: 'Primary brand color',
    example: '#1E40AF',
    required: false,
  })
  primary_color?: string;

  @ApiProperty({
    description: 'Secondary brand color',
    example: '#3B82F6',
    required: false,
  })
  secondary_color?: string;

  @ApiProperty({
    description: 'Accent brand color',
    example: '#60A5FA',
    required: false,
  })
  accent_color?: string;

  @ApiProperty({
    description: 'Installation completion status',
    example: true,
  })
  installation_completed: boolean;

  @ApiProperty({
    description: 'Message to display',
    example: 'School installation completed successfully',
  })
  message: string;
}
