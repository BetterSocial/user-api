const request = require('supertest');
const app = require('../../../app');
const {createUser} = require('../__setups__/utils');
// const {StreamChat} = require('stream-chat');
// const jwt = require('jsonwebtoken');

jest.mock('stream-chat');
jest.mock('jsonwebtoken');

beforeEach(() => {
  jest.clearAllMocks();
  createUser();
});

const __generateQueryChannelsParamsCall = (userId, limit, offset) => {
  return [{members: {$in: [userId]}}, [{last_message_at: -1}], {limit, offset, state: true}];
};

const __getSignedChannelListBodyExpectation = expect.objectContaining({
  code: 200,
  data: expect.arrayContaining([
    expect.objectContaining({
      members: expect.arrayContaining([expect.any(Object)]),
      messages: expect.any(String)
    })
  ]),
  status: 'Success retrieve channels'
});

// const expectGetSignedChannelListFlow = (userId) => {
//   expect(jwt.verify).toHaveBeenCalled();
//   expect(StreamChat._instance).toBeInstanceOf(StreamChat);
//   expect(StreamChat._instance.connectUser).toHaveBeenCalledWith({id: userId}, 'valid-token');

//   expect(StreamChat._instance.disconnectUser).toHaveBeenCalled();
// };

describe('GET /chat/channels/signed', () => {
  // test('should return 200 OK with list of channels', async () => {
  //   const user = await createUser();

  //   const response = await request(app)
  //     .get('/api/v1/chat/channels/signed')
  //     .set({Authorization: `Bearer valid-token`})
  //     .expect(200);

  //   expect(response.body).toEqual(__getSignedChannelListBodyExpectation);
  //   expectGetSignedChannelListFlow(user.user_id);

  //   expect(StreamChat._instance.queryChannels).toHaveBeenNthCalledWith(
  //     1,
  //     ...__generateQueryChannelsParamsCall(user.user_id, 30, 0)
  //   );
  //   expect(StreamChat._instance.queryChannels).toHaveBeenNthCalledWith(
  //     2,
  //     ...__generateQueryChannelsParamsCall(user.user_id, 30, 30)
  //   );
  //   expect(StreamChat._instance.queryChannels).toHaveBeenNthCalledWith(
  //     3,
  //     ...__generateQueryChannelsParamsCall(user.user_id, 30, 60)
  //   );
  //   expect(StreamChat._instance.queryChannels).toHaveBeenNthCalledWith(
  //     4,
  //     ...__generateQueryChannelsParamsCall(user.user_id, 10, 90)
  //   );
  // });

  // test('should return 200 OK with list of channels with offset only', async () => {
  //   const user = await createUser();

  //   const response = await request(app)
  //     .get('/api/v1/chat/channels/signed?offset=10')
  //     .set({Authorization: `Bearer valid-token`})
  //     .expect(200);

  //   expect(response.body).toEqual(__getSignedChannelListBodyExpectation);
  //   expectGetSignedChannelListFlow(user.user_id);

  //   expect(StreamChat._instance.queryChannels).toHaveBeenNthCalledWith(
  //     1,
  //     ...__generateQueryChannelsParamsCall(user.user_id, 30, 10)
  //   );
  //   expect(StreamChat._instance.queryChannels).toHaveBeenNthCalledWith(
  //     2,
  //     ...__generateQueryChannelsParamsCall(user.user_id, 30, 40)
  //   );
  //   expect(StreamChat._instance.queryChannels).toHaveBeenNthCalledWith(
  //     3,
  //     ...__generateQueryChannelsParamsCall(user.user_id, 30, 70)
  //   );
  //   expect(StreamChat._instance.queryChannels).toHaveBeenNthCalledWith(
  //     4,
  //     ...__generateQueryChannelsParamsCall(user.user_id, 10, 100)
  //   );
  // });

  // test('should return 200 OK with list of channels with limit only', async () => {
  //   const user = await createUser();

  //   const response = await request(app)
  //     .get('/api/v1/chat/channels/signed?limit=10')
  //     .set({Authorization: `Bearer valid-token`})
  //     .expect(200);

  //   expect(response.body).toEqual(__getSignedChannelListBodyExpectation);
  //   expectGetSignedChannelListFlow(user.user_id);

  //   expect(StreamChat._instance.queryChannels).toHaveBeenNthCalledWith(
  //     1,
  //     ...__generateQueryChannelsParamsCall(user.user_id, 10, 0)
  //   );
  // });

  // test('should return 200 OK with list of channels with limit and offset', async () => {
  //   const user = await createUser();

  //   const response = await request(app)
  //     .get('/api/v1/chat/channels/signed?limit=10&offset=10')
  //     .set({Authorization: `Bearer valid-token`})
  //     .expect(200);

  //   expect(response.body).toEqual(__getSignedChannelListBodyExpectation);
  //   expectGetSignedChannelListFlow(user.user_id);

  //   expect(StreamChat._instance.queryChannels).toHaveBeenNthCalledWith(
  //     1,
  //     ...__generateQueryChannelsParamsCall(user.user_id, 10, 10)
  //   );
  // });

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
