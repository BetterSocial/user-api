const supertest = require('supertest');
const app = require('../../../app');
const generateUserAndFollowSeeds = require('../__utils__/seeds/users_and_follow_seeds');
const generateUserAndTopicSeeds = require('../__utils__/seeds/users_and_topics_seeds');
const generateUserAndLocationsSeeds = require('../__utils__/seeds/users_and_locations_seeds');
const refreshAllMaterializedViews = require('../__utils__/seeds/refresh_all_materialized_views_seeds');

describe('GET /who-to-follow/list', () => {
  test('Should return 200 OK when query params provided', async () => {
    const {users} = await generateUserAndFollowSeeds();
    const {topics} = await generateUserAndTopicSeeds(users);
    const {locations} = await generateUserAndLocationsSeeds(users);
    await refreshAllMaterializedViews();

    // query params: topics=[1], locations=[1]
    const response = await supertest(app).get(
      '/who-to-follow/list?topics=%5B%221%22%5D&locations=%5B%221%22%5D'
    );
    expect(response.status).toBe(200);

    // Expect label location and label topic exists since they are followed on seeds
    expect(response.body.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          viewtype: 'labellocation',
          city: locations[0].city
        }),
        expect.objectContaining({
          viewtype: 'labeltopic',
          name: topics[0].name
        })
      ])
    );

    // Expect the first user is MY_USER that is being followed the most on seeds
    expect(response.body.body[1]).toEqual(
      expect.objectContaining({
        user_id: 'c68a34b3-6d5b-4f15-b62d-a22050a34921'
      })
    );
  });

  test('Should return 200 OK with no data when query params provided', async () => {
    const {users} = await generateUserAndFollowSeeds();
    await generateUserAndTopicSeeds(users);
    await generateUserAndLocationsSeeds(users);
    await refreshAllMaterializedViews();

    // query params: topics=[2], locations=[2]
    const response = await supertest(app).get(
      '/who-to-follow/list?topics=%5B%222%22%5D&locations=%5B%222%22%5D'
    );
    expect(response.status).toBe(200);
    expect(response.body.body).toEqual([]);
  });

  test('Should return 403 Invalid query when no query params provided', async () => {
    const response = await supertest(app).get('/who-to-follow/list');
    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      code: 403,
      status: 'error',
      message: 'Invalid query'
    });
  });

  test('Should return 403 arrayEmpty error when topics and locations are empty array', async () => {
    const response = await supertest(app).get('/who-to-follow/list?topics=[]&locations=[]');
    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      code: 403,
      status: 'error',
      message: [
        {
          type: 'arrayEmpty',
          message: "The 'topics' field must not be an empty array.",
          field: 'topics',
          actual: []
        },
        {
          type: 'arrayEmpty',
          message: "The 'locations' field must not be an empty array.",
          field: 'locations',
          actual: []
        }
      ]
    });
  });
});
