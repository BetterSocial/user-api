const request = require('supertest');
const app = require('../../../app');
const generateUserAndFollowSeeds = require('../__utils__/seeds/users_and_follow_seeds');
const generateTopicAndUserTopics = require('../__utils__/seeds/topic_and_user_topic_seeds');
const {createReusableAuthTestSuite} = require('../__authTest__/createReusableAuthTestSuite');

beforeEach(async () => {
  await generateUserAndFollowSeeds();
  await generateTopicAndUserTopics();
});

const arrayOfTopicsListExpected = expect.objectContaining({
  user_topics_id: expect.any(String),
  user_id: expect.any(String),
  topic_id: expect.any(String),
  createdAt: expect.any(String),
  updatedAt: expect.any(String)
});

describe('GET /topics/follow', () => {
  createReusableAuthTestSuite(request(app).get('/topics/follow'));
  test('should return 200 OK with user topic id and search by topic name', async () => {
    // Execution
    const response = await request(app)
      .get('/topics/follow')
      .query({name: 'Topic 1'})
      .set('Authorization', 'Bearer token');

    // Assertion
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toEqual(arrayOfTopicsListExpected);
  });

  test('should return 400 Forbidden if name query not included', async () => {
    // Execution
    const response = await request(app).get('/topics/follow').set('Authorization', 'Bearer token');

    // Assertion
    expect(response.statusCode).toBe(400);
    expect(response.body.status).toEqual('fail');
    expect(response.body.message).toEqual("The 'name' field is required.");
  });

  test('should return 404 if topic not found', async () => {
    // Execution
    const response = await request(app)
      .get('/topics/follow')
      .query({name: 'Topic Not Found'})
      .set('Authorization', 'Bearer token');

    // Assertion
    expect(response.statusCode).toBe(404);
    expect(response.body.status).toEqual('fail');
    expect(response.body.message).toEqual('Topic not found');
  });
});

describe('PUT /topics/follow', () => {
  createReusableAuthTestSuite(request(app).put('/topics/follow/'));
  test('should return 200 OK with delete topics', async () => {
    // Execution
    const response = await request(app)
      .put('/topics/follow/')
      .set('Authorization', 'Bearer token')
      .send({
        name: 'Topic 1'
      });

    // Assertion
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Success delete topic user');
  });

  test('should return 200 OK with add topics', async () => {
    // Execution
    const response = await request(app)
      .put('/topics/follow/')
      .set('Authorization', 'Bearer token')
      .send({
        name: 'Topic Outer'
      });

    // Assertion
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Success add topic user');
  });

  test('should return 404 with topic not found', async () => {
    // Execution
    const response = await request(app)
      .put('/topics/follow/')
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
    const response = await request(app).put('/topics/follow/').set('Authorization', 'Bearer token');

    // Assertion
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("The 'name' field is required.");
  });
});
