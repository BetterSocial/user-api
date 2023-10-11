const deleteActivityFromUserFeed = require('../../../services/getstream/deleteActivityFromUserFeed');
const {removeActivityQueue} = require('../../../services/score/queueSenderForRedis');

jest.spyOn(removeActivityQueue, 'add').mockImplementation(() => true);

describe('deleteActivityFromUserFeed', () => {
  it('should throw an error if all parameters are not provided', async () => {
    const response = await deleteActivityFromUserFeed();
    await expect(response.error).toEqual('Invalid parameters');
  });

  it('should delete activity from user feed', async () => {
    const feed = 'feed';
    const userId = 'userId';
    const activityId = 'activityId';
    const response = await deleteActivityFromUserFeed(feed, userId, activityId);
    expect(response).toBe(true);
  });
});
