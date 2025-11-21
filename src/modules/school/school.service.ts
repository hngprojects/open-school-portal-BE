import * as fs from 'fs/promises';
import * as path from 'path';

import { Injectable, ConflictException } from '@nestjs/common';
import * as sharp from 'sharp';

import { IMulterFile } from '../../common/types/multer.types';
import * as sysMsg from '../../constants/system.messages';

import { CreateInstallationDto } from './dto/create-installation.dto';
import { InstallationResponseDto } from './dto/installation-response.dto';
import { SchoolModelAction } from './model-actions/school-actions';

@Injectable()
export class SchoolService {
  constructor(private readonly schoolModelAction: SchoolModelAction) {}

  async processInstallation(
    createInstallationDto: CreateInstallationDto,
    logoFile?: IMulterFile,
  ): Promise<InstallationResponseDto> {
    // Check if installation already completed
    const completedSchool = await this.schoolModelAction.get({
      identifierOptions: { installation_completed: true },
    });
    if (completedSchool) {
      throw new ConflictException(sysMsg.INSTALLATION_ALREADY_COMPLETED);
    }

    // Check if school name already exists
    const schoolWithSameName = await this.schoolModelAction.get({
      identifierOptions: { school_name: createInstallationDto.school_name },
    });
    if (schoolWithSameName) {
      throw new ConflictException(
        `School with name "${createInstallationDto.school_name}" already exists`,
      );
    }

    let logoUrl: string | null = null;

    // Process logo file if provided
    if (logoFile) {
      logoUrl = await this.uploadLogo(logoFile);
    }

    // Create school record
    const school = await this.schoolModelAction.create({
      createPayload: {
        school_name: createInstallationDto.school_name,
        logo_url: logoUrl,
        primary_color: createInstallationDto.primary_color,
        secondary_color: createInstallationDto.secondary_color,
        accent_color: createInstallationDto.accent_color,
        installation_completed: true,
      },
      transactionOptions: { useTransaction: false },
    });

    return {
      id: school.id,
      school_name: school.school_name,
      logo_url: school.logo_url,
      primary_color: school.primary_color,
      secondary_color: school.secondary_color,
      accent_color: school.accent_color,
      installation_completed: school.installation_completed,
      message: sysMsg.INSTALLATION_COMPLETED,
    };
  }

  private async uploadLogo(logoFile: IMulterFile): Promise<string> {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads', 'schools');
    await fs.mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `logo-${timestamp}.png`;
    const filePath = path.join(uploadsDir, fileName);

    // Process image with sharp (resize, optimize, convert to PNG)
    await sharp(logoFile.buffer)
      .resize(500, 500, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .png({ quality: 90 })
      .toFile(filePath);

    // Return relative URL path
    return `/uploads/schools/${fileName}`;
  }

  private async deleteLogoFile(logoUrl: string): Promise<void> {
    const filePath = path.join(process.cwd(), logoUrl);
    await fs.unlink(filePath);
  }
}
