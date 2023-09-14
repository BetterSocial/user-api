const request = require('supertest');
const app = require('../../../app');

const {LimitTopics, Topics} = require('../../../databases/models');

describe('GET /topics/list', () => {
  test('should return 200 OK with list of topics', async () => {
    // Preparation
    await LimitTopics.create({
      limit: 10,
      created_at: new Date(),
      updated_at: new Date()
    });
    const iconPath = 'anypath';
    await Topics.bulkCreate([
      {
        name: 'Topic 1',
        sort: 1,
        categories: 'Category 1',
        icon_path: iconPath,
        created_at: new Date()
      },
      {
        name: 'Topic 2',
        sort: 2,
        categories: 'Category 1',
        icon_path: iconPath,
        created_at: new Date()
      },
      {
        name: 'Topic 3',
        sort: 3,
        categories: 'Category 2',
        icon_path: iconPath,
        created_at: new Date()
      },
      {
        name: 'Topic 4',
        sort: 4,
        categories: 'Category 2',
        icon_path: iconPath,
        created_at: new Date()
      }
    ]);

    // Execution
    const response = await request(app).get('/topics/list');

    // Assertion
    expect(response.statusCode).toBe(200);
    expect(response.body.body).toEqual({
      'Category 1': expect.arrayContaining([
        expect.objectContaining({
          name: expect.any(String)
        })
      ]),
      'Category 2': expect.arrayContaining([
        expect.objectContaining({
          name: expect.any(String)
        })
      ])
    });

    expect(true).toBe(true);
  });
});
