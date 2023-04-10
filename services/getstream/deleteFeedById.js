const stream = require("getstream");
const moment = require('moment');
const GetstreamSingleton = require("../../vendor/getstream/singleton");

module.exports = async (token, feedGroup, activityId) => {
  const client = stream.connect(process.env.API_KEY, token, process.env.APP_ID);
  const serverClient = GetstreamSingleton.getInstance()
  const user = client.feed(feedGroup, client.userId, token);
  serverClient.activityPartialUpdate({ 
    id: activityId,
    set: {
      expired_at: moment().toISOString(),
      is_deleted: true
    }
  })

  return user.removeActivity(activityId);
};
