import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import * as sysMsg from '../../../constants/system.messages';
import { AcademicSession } from '../entities/academic-session.entity';

import { SessionStatisticsResponseDto } from './dto/session-statistics-response.dto';

@Injectable()
export class SessionsStatisticsService {
  private readonly logger = new Logger(SessionsStatisticsService.name);

  constructor(
    @InjectRepository(AcademicSession)
    private readonly academicSessionRepository: Repository<AcademicSession>,
    private readonly dataSource: DataSource,
  ) {}

  async getSessionStatistics(
    sessionId: string,
  ): Promise<SessionStatisticsResponseDto> {
    // 1. Verify session exists
    const session = await this.academicSessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException(sysMsg.RESOURCE_NOT_FOUND);
    }

    // 2. System aggregates all counts
    const statistics = await this.aggregateSessionStatistics(sessionId);

    const responseData: SessionStatisticsResponseDto = {
      sessionId: session.id,
      sessionName: session.name,
      startDate: session.startDate,
      endDate: session.endDate,
      status: session.status,
      totalClasses: statistics.classCount,
      totalStreams: statistics.streamCount,
      totalStudents: statistics.studentCount,
      totalTeachers: statistics.teacherCount,
      generatedAt: new Date(),
    };

    return responseData;
  }

  private async aggregateSessionStatistics(sessionId: string): Promise<{
    classCount: number;
    streamCount: number;
    studentCount: number;
    teacherCount: number;
  }> {
    // Use a single optimized query for better performance with large datasets
    const query = `
      SELECT 
        -- Count distinct classes from class_teachers table
        (SELECT COUNT(DISTINCT class_id) FROM class_teachers WHERE session_id = $1) as class_count,
        
        -- Count streams from session_streams table
        (SELECT COUNT(*) FROM session_streams WHERE session_id = $1) as stream_count,
        
        -- Count distinct students from class_students table  
        (SELECT COUNT(DISTINCT student_id) FROM class_students WHERE session_id = $1) as student_count,
        
        -- Count distinct teachers from class_teachers table
        (SELECT COUNT(DISTINCT teacher_id) FROM class_teachers WHERE session_id = $1) as teacher_count
    `;

    const result = await this.dataSource.query(query, [sessionId]);

    if (!result || result.length === 0) {
      return this.getZeroStatistics();
    }

    const stats = result[0];

    return {
      classCount: parseInt(stats.class_count) || 0,
      streamCount: parseInt(stats.stream_count) || 0,
      studentCount: parseInt(stats.student_count) || 0,
      teacherCount: parseInt(stats.teacher_count) || 0,
    };
  }

  private async getCountFromTable(
    tableName: string,
    columnName: string,
    sessionId: string,
  ): Promise<number> {
    const result = await this.dataSource.query(
      `SELECT COUNT(DISTINCT ${columnName}) as count FROM ${tableName} WHERE session_id = $1`,
      [sessionId],
    );
    return parseInt(result[0]?.count) || 0;
  }

  private async getStreamCount(sessionId: string): Promise<number> {
    const possibleTables = ['session_streams', 'streams', 'class_streams'];

    for (const tableName of possibleTables) {
      try {
        const result = await this.dataSource.query(
          `SELECT COUNT(*) as count FROM ${tableName} WHERE session_id = $1`,
          [sessionId],
        );
        const count = parseInt(result[0]?.count) || 0;
        return count;
      } catch {
        continue;
      }
    }

    return 0;
  }

  private getZeroStatistics(): {
    classCount: number;
    streamCount: number;
    studentCount: number;
    teacherCount: number;
  } {
    return {
      classCount: 0,
      streamCount: 0,
      studentCount: 0,
      teacherCount: 0,
    };
  }
}
