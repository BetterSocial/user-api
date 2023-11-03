const supertest = require('supertest');
const app = require('../../../app');
const {
  createReusableAuthTestSuite,
  createReusablePreventAnonymousUserTestSuite
} = require('../__authTest__/createReusableAuthTestSuite');
const generateUserAndFollowSeeds = require('../__utils__/seeds/users_and_follow_seeds');

beforeEach(async () => {
  await generateUserAndFollowSeeds();
});

describe('POST /chat/send-signed-message', () => {
  createReusableAuthTestSuite(supertest(app).post('/api/v1/chat/send-signed-message'));
  createReusablePreventAnonymousUserTestSuite(
    supertest(app)
      .post('/api/v1/chat/send-signed-message')
      .set({Authorization: 'Bearer anon-token'})
  );

  test('should return 403 error validation if channelId is not provided', async () => {
    const response = await supertest(app)
      .post('/api/v1/chat/send-signed-message')
      .set({Authorization: `Bearer token`})
      .send({
        message: 'Hello World',
        channelType: 1
      })
      .expect(403);

    expect(response.body).toEqual(
      expect.objectContaining({
        message: 'Error validation',
        error: expect.arrayContaining([
          expect.objectContaining({
            field: 'channelId',
            message: expect.any(String)
          })
        ])
      })
    );
  });

  test('should return 403 error validation if message is not provided', async () => {
    const response = await supertest(app)
      .post('/api/v1/chat/send-signed-message')
      .set({Authorization: `Bearer token`})
      .send({
        channelId: 'channel-id',
        channelType: 1
      })
      .expect(403);

    expect(response.body).toEqual(
      expect.objectContaining({
        message: 'Error validation',
        error: expect.arrayContaining([
          expect.objectContaining({
            field: 'message',
            message: expect.any(String)
          })
        ])
      })
    );
  });

  test('should return 403 error validation if channelType is not chat or group', async () => {
    const response = await supertest(app)
      .post('/api/v1/chat/send-signed-message')
      .set({Authorization: `Bearer token`})
      .send({
        message: 'Hello World',
        channelType: 3
      })
      .expect(403);

    expect(response.body).toEqual(
      expect.objectContaining({
        message: 'Error validation',
        error: expect.arrayContaining([
          expect.objectContaining({
            message: expect.any(String)
          })
        ])
      })
    );
  });
});
