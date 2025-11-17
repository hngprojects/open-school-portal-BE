import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { SessionsService } from '../src/modules/auth/sessions.service';

describe('/auth/sessions (GET)', () => {
  let app: INestApplication;
  let sessionService: SessionsService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    sessionService = module.get(SessionsService);
    await app.init();
  });

  it('should return active sessions for a user', async () => {
    jest
      .spyOn(sessionService, 'getActiveSessions')
      .mockResolvedValue([{ id: 'abc' }] as any);

    return request(app.getHttpServer())
      .get('/auth/sessions')
      .set('Authorization', 'Bearer MOCK_TOKEN')
      .expect(200)
      .expect([{ id: 'abc' }]);
  });

  afterAll(async () => {
    await app.close();
  });
});
