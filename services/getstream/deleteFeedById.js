const stream = require('getstream');
const moment = require('moment');
const GetstreamSingleton = require('../../vendor/getstream/singleton');

module.exports = async ({feedGroup, activityId, userId = '', token = ''}) => {
  const client = stream.connect(process.env.API_KEY, process.env.SECRET, process.env.APP_ID);
  const feed = client.feed(feedGroup, userId, token);
  const serverClient = GetstreamSingleton.getInstance();
  serverClient.activityPartialUpdate({
    id: activityId,
    set: {
      expired_at: moment().toISOString(),
      is_deleted: true
    }
  });
  const result = await feed.removeActivity(activityId);
  return result;
};
