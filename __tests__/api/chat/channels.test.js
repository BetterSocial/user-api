const request = require('supertest');
const app = require('../../../app');
const {creatUser} = require('../__setups__/utils');
const {StreamChat} = require('stream-chat');
const jwt = require('jsonwebtoken');

jest.mock('stream-chat');
jest.mock('jsonwebtoken');

afterEach(() => {
  jest.clearAllMocks();
});

describe('GET /chat/channels/signed', () => {
  test('should return 200 OK with list of channels', async () => {
    const user = await creatUser();

    const response = await request(app)
      .get('/api/v1/chat/channels/signed')
      .set({Authorization: `Bearer valid-token`})
      .expect(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        code: 200,
        data: expect.arrayContaining([
          expect.objectContaining({
            members: expect.arrayContaining([expect.any(Object)]),
            messages: expect.any(String)
          })
        ]),
        status: 'Success retrieve channels'
      })
    );

    expect(jwt.verify).toHaveBeenCalled();
    expect(StreamChat.getInstance).toHaveBeenCalled();
    expect(StreamChat._instance).toBeInstanceOf(StreamChat);
    expect(StreamChat._instance.connectUser).toHaveBeenCalledWith(
      {id: user.user_id},
      'valid-token'
    );
    expect(StreamChat._instance.queryChannels).toHaveBeenCalledWith(
      {type: 'messaging', members: {$in: [user.user_id]}},
      [{last_message_at: -1}]
    );
    expect(StreamChat._instance.disconnectUser).toHaveBeenCalled();
  });

  test('should return 401 Unauthorized', async () => {
    const response = await request(app)
      .get('/api/v1/chat/channels/signed')
      .set({Authorization: `Bearer invalid-token`})
      .expect(401);
    expect(response.body).toEqual(
      expect.objectContaining({
        code: 401,
        message: expect.any(String),
        data: null
      })
    );
  });
});
