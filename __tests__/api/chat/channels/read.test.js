const supertest = require('supertest');
const app = require('../../../../app');
const generateUserAndFollowSeeds = require('../../__utils__/seeds/users_and_follow_seeds');
const {
  createReusableAuthTestSuite,
  createReusablePreventAnonymousUserTestSuite
} = require('../../__authTest__/createReusableAuthTestSuite');

beforeEach(async () => {
  await generateUserAndFollowSeeds();
});

describe('POST /chat/channels/read', () => {
  createReusableAuthTestSuite(
    supertest(app)
      .post('/api/v1/chat/channels/read')
      .send({channelId: 'channel-id', channelType: 1})
  );
  createReusablePreventAnonymousUserTestSuite(
    supertest(app)
      .post('/api/v1/chat/channels/read')
      .set({Authorization: 'Bearer anon-token'})
      .send({channelId: 'channel-id', channelType: 1})
  );

  test('should return 403 error validation if channelId is not provided', async () => {
    const response = await supertest(app)
      .post('/api/v1/chat/channels/read')
      .set({Authorization: `Bearer token`})
      .send({
        channelType: 1
      })
      .expect(403);

    expect(response.body).toEqual(
      expect.objectContaining({
        status: 'error validation',
        message: expect.arrayContaining([
          expect.objectContaining({
            field: 'channelId',
            message: expect.any(String)
          })
        ])
      })
    );
  });

  test('should return 403 error validation if channel type is not provided', async () => {
    const response = await supertest(app)
      .post('/api/v1/chat/channels/read')
      .set({Authorization: `Bearer token`})
      .send({
        channelId: 'channel-id'
      })
      .expect(403);

    expect(response.body).toEqual(
      expect.objectContaining({
        status: 'error validation',
        message: expect.arrayContaining([
          expect.objectContaining({
            field: 'channelType',
            message: expect.any(String)
          })
        ])
      })
    );
  });
});
