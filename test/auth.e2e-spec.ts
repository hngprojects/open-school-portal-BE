import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';

import { AppModule } from '../src/app.module';

describe('Auth E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    // Seed a test user manually
    const userService = app.get('UserService');
    await userService.createUser({
      createPayload: {
        reg_no: 'test123',
        password:
          '$2a$10$Kw4jp7hGg9mVnAiLzIY5EeA6AXYF1m6.euPxX2OZEur1XBYncjY5G', // bcrypt hash for 'password'
      },
      transactionOptions: { useTransaction: false },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('logs in successfully', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ reg_no: 'test123', password: 'password' })
      .expect(200);

    expect(res.body.data.accessToken).toBeDefined();
  });

  it('fails with wrong credentials', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ reg_no: 'test123', password: 'wrongpass' })
      .expect(401);
  });
});
