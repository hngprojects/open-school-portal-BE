import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

import { AppModule } from '../src/app.module';

describe('Installation API (e2e)', () => {
  let app: INestApplication;
  let schoolRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    // Get repository to clean up test data
    schoolRepository = moduleFixture.get('SchoolRepository');
  });

  afterAll(async () => {
    // Clean up test data
    await schoolRepository.delete({});
    await app.close();
  });

  describe('POST /api/v1/install', () => {
    it('should successfully install school with minimal data', () => {
      return request(app.getHttpServer())
        .post('/api/v1/install')
        .field('school_name', 'Test School Automated')
        .expect(201)
        .expect((res) => {
          expect(res.body.status_code).toBe(201);
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.school_name).toBe('Test School Automated');
          expect(res.body.data.installation_completed).toBe(true);
          expect(res.body.data.message).toBe(
            'school installation completed successfully',
          );
        });
    });

    it('should install school with branding colors', () => {
      return request(app.getHttpServer())
        .post('/api/v1/install')
        .field('school_name', 'Colorful School')
        .field('primary_color', '#1E40AF')
        .field('secondary_color', '#3B82F6')
        .field('accent_color', '#60A5FA')
        .expect(201)
        .expect((res) => {
          expect(res.body.data.primary_color).toBe('#1E40AF');
          expect(res.body.data.secondary_color).toBe('#3B82F6');
          expect(res.body.data.accent_color).toBe('#60A5FA');
        });
    });

    it('should reject duplicate installation', async () => {
      // First installation
      await request(app.getHttpServer())
        .post('/api/v1/install')
        .field('school_name', 'Unique School')
        .expect(201);

      // Second installation attempt
      return request(app.getHttpServer())
        .post('/api/v1/install')
        .field('school_name', 'Another School')
        .expect(409)
        .expect((res) => {
          expect(res.body.message).toBe(
            'school installation already completed',
          );
        });
    });

    it('should reject duplicate school name', () => {
      return request(app.getHttpServer())
        .post('/api/v1/install')
        .field('school_name', 'Test School Automated')
        .expect(409)
        .expect((res) => {
          expect(res.body.message).toContain('already exists');
        });
    });

    it('should validate required school_name field', () => {
      return request(app.getHttpServer())
        .post('/api/v1/install')
        .field('primary_color', '#1E40AF')
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('school_name');
        });
    });

    it('should validate hex color format', () => {
      return request(app.getHttpServer())
        .post('/api/v1/install')
        .field('school_name', 'Invalid Color School')
        .field('primary_color', 'blue')
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('valid hex color');
        });
    });

    it('should accept valid hex colors', () => {
      return request(app.getHttpServer())
        .post('/api/v1/install')
        .field('school_name', 'Valid Color School')
        .field('primary_color', '#FF5733')
        .expect(201)
        .expect((res) => {
          expect(res.body.data.primary_color).toBe('#FF5733');
        });
    });

    it('should have correct response structure', () => {
      return request(app.getHttpServer())
        .post('/api/v1/install')
        .field('school_name', 'Structure Test School')
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('status_code');
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data).toHaveProperty('school_name');
          expect(res.body.data).toHaveProperty('logo_url');
          expect(res.body.data).toHaveProperty('primary_color');
          expect(res.body.data).toHaveProperty('secondary_color');
          expect(res.body.data).toHaveProperty('accent_color');
          expect(res.body.data).toHaveProperty('installation_completed');
          expect(res.body.data).toHaveProperty('message');
        });
    });
  });
});
