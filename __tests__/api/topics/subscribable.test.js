const supertest = require('supertest');
const app = require('../../../app');
const {createReusableAuthTestSuite} = require('../__authTest__/createReusableAuthTestSuite');
const generateMyUserFollowTopicSeeds = require('../__utils__/seeds/my_user_follow_topic_seeds');
const generateTopicSeeds = require('../__utils__/seeds/topic_seeds');
const generateUserAndFollowSeeds = require('../__utils__/seeds/users_and_follow_seeds');

beforeEach(async () => {
  await generateUserAndFollowSeeds();
});

const TOPIC_BODY_EXPECTATION = expect.arrayContaining([
  expect.objectContaining({
    name: expect.any(String)
  })
]);

describe('GET /topics/subscribable', () => {
  createReusableAuthTestSuite(supertest(app).get('/topics/subscribable'));

  test('Should return 200 OK with topics and topic follow history', async () => {
    // Setup

    const {topics} = await generateTopicSeeds();
    await generateMyUserFollowTopicSeeds(topics);

    // Execution
    const response = await supertest(app)
      .get('/topics/subscribable')
      .set('Authorization', 'Bearer token');

    // Assertion
    const topicsFollowed = response.body.data.topics;
    const topicsHistory = response.body.data.history;

    expect(topicsFollowed.length).toEqual(5);
    expect(topicsFollowed).toEqual(TOPIC_BODY_EXPECTATION);

    expect(topicsHistory.length).toEqual(10);
    expect(topicsHistory).toEqual(TOPIC_BODY_EXPECTATION);
  });

  test('Should return 200 OK with topics and topic follow history after unfollowing topic', async () => {
    // Setup
    const {topics} = await generateTopicSeeds();
    await generateMyUserFollowTopicSeeds(topics, true);

    // Execution
    const response = await supertest(app)
      .get('/topics/subscribable')
      .set('Authorization', 'Bearer token');

    // Assertion
    const topicsFollowed = response.body.data.topics;
    const topicsHistory = response.body.data.history;

    expect(topicsFollowed.length).toEqual(2);
    expect(topicsFollowed).toEqual(TOPIC_BODY_EXPECTATION);

    expect(topicsHistory.length).toEqual(10);
    expect(topicsHistory).toEqual(TOPIC_BODY_EXPECTATION);
  });
});
