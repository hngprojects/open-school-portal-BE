import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

import { AppModule } from '../src/app.module';
import { RedisService } from '../src/modules/redis/redis.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let redisService: RedisService;

  const testUser = {
    email: 'john.doe@example.com',
    password: 'password123',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    redisService = moduleFixture.get<RedisService>(RedisService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/request-password-reset (POST)', () => {
    it('should return a success message when requesting a password reset for an existing user', () => {
      return request(app.getHttpServer())
        .post('/auth/request-password-reset')
        .send({ email: testUser.email })
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBeDefined();
        });
    });

    it('should return a NotFoundException when requesting a password reset for a non-existent user', () => {
      return request(app.getHttpServer())
        .post('/auth/request-password-reset')
        .send({ email: 'nonexistent@example.com' })
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toBeDefined();
          expect(res.body.statusCode).toEqual(404);
        });
    });
  });

  describe('/auth/reset-password (POST)', () => {
    it('should return a success message when resetting a password with a valid OTP', async () => {
      await request(app.getHttpServer())
        .post('/auth/request-password-reset')
        .send({ email: testUser.email });

      const otp = await redisService.get(`otp:${testUser.email}`);

      return request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({ email: testUser.email, otp, password: 'newpassword' })
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBeDefined();
        });
    });

    it('should return a BadRequestException when resetting a password with an invalid OTP', () => {
      return request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          email: testUser.email,
          otp: 'invalid',
          password: 'newpassword',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBeDefined();
          expect(res.body.statusCode).toEqual(400);
        });
    });

    it('should return a NotFoundException when resetting a password for a non-existent user', () => {
      return request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          email: 'nonexistent@example.com',
          otp: '123456',
          password: 'newpassword',
        })
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toBeDefined();
          expect(res.body.statusCode).toEqual(404);
        });
    });
  });
});
