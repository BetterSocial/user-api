const stream = require("getstream");
const moment = require('moment')

module.exports = async (token, feedGroup, activityId) => {
  const client = stream.connect(process.env.API_KEY, token, process.env.APP_ID);
  const user = client.feed(feedGroup, client.userId, token);
  client.activityPartialUpdate(activityId, { expired_at: moment().toISOString()})
  // return user.removeActivity(activityId);
};
