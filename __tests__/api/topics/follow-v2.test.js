const request = require('supertest');
const app = require('../../../app');
const generateUserAndFollowSeeds = require('../__utils__/seeds/users_and_follow_seeds');
const generateTopicAndUserTopics = require('../__utils__/seeds/topic_and_user_topic_seeds');
const {createReusableAuthTestSuite} = require('../__authTest__/createReusableAuthTestSuite');

jest.mock('../../../services/getstream');

beforeEach(async () => {
  await generateUserAndFollowSeeds();
  await generateTopicAndUserTopics();
});

describe('PUT /topics/follow-v2', () => {
  createReusableAuthTestSuite(request(app).put('/topics/follow-v2'));
  test('should return 200 OK with delete topics', async () => {
    // Execution
    const response = await request(app)
      .put('/topics/follow-v2')
      .set('Authorization', 'Bearer token')
      .send({
        name: 'Topic 1'
      });

    // Assertion
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Success delete topic user v2');
  });

  test('should return 200 OK with add topics', async () => {
    // Execution
    const response = await request(app)
      .put('/topics/follow-v2')
      .set('Authorization', 'Bearer token')
      .send({
        name: 'Topic Outer'
      });

    // Assertion
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Success add topic user v2');
  });

  test('should return 404 with topic not found', async () => {
    // Execution
    const response = await request(app)
      .put('/topics/follow-v2')
      .set('Authorization', 'Bearer token')
      .send({
        name: 'Topic Not Found'
      });
    // Assertion
    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe('Topic not found');
  });

  test('should return 400 with name field required', async () => {
    // Execution
    const response = await request(app)
      .put('/topics/follow-v2')
      .set('Authorization', 'Bearer token');

    // Assertion
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("The 'name' field is required.");
  });
});
