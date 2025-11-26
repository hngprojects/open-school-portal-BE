import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

// enum for supported database types
export enum DatabaseType {
  POSTGRES = 'postgres',
  MYSQL = 'mysql',
  MARIADB = 'mariadb',
  SQLITE = 'sqlite',
  MSSQL = 'mssql',
}

export class ConfigureDatabaseDto {
  @ApiProperty({
    description: 'Database name',
    example: 'open_school_portal_db',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  database_name: string;

  @ApiProperty({
    description: 'Database type (postgres, mysql, mariadb, etc.)',
    example: 'postgres',
    enum: DatabaseType,
    required: true,
  })
  @IsEnum(DatabaseType)
  @IsNotEmpty()
  database_type: DatabaseType;

  @ApiProperty({
    description: 'Database host',
    example: 'localhost',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  database_host: string;

  @ApiProperty({
    description: 'Database username',
    example: 'root',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(50)
  database_username: string;

  @ApiProperty({
    description: 'Database port',
    example: 5432,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(2)
  @Max(65535)
  database_port: number;

  @ApiProperty({
    description: 'Database password',
    example: 'password',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(50)
  database_password: string;
}
export class CreateDatabaseSuccessResponseDto {
  @ApiProperty({
    description: 'Database ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Database name',
    example: 'school_database',
  })
  @Expose()
  database_name: string;

  @ApiProperty({
    description: 'Database host',
    example: 'localhost',
  })
  @Expose()
  database_host: string;

  @ApiProperty({
    description: 'Database username',
    example: 'root',
  })
  @Expose()
  database_username: string;

  @ApiProperty({
    description: 'Database port',
    example: 5432,
  })
  @Expose()
  database_port: number;

  @ApiProperty({
    description: 'Created at timestamp',
    type: Date,
  })
  @Expose({ name: 'createdAt' })
  created_at: Date;

  @ApiProperty({
    description: 'Updated at timestamp',
    type: Date,
  })
  @Expose({ name: 'updatedAt' })
  updated_at: Date;
}
