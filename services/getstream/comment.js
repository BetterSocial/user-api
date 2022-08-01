const stream = require("getstream");

module.exports = async (activityId, userId, useridFeed, message, token, sendPostNotif) => {
  const clientUser = stream.connect(
    process.env.API_KEY,
    token,
    process.env.APP_ID
  );
  let targetFeed = [`notification:${useridFeed}`]
  if(sendPostNotif) {
    if(useridFeed !== userId) {
      targetFeed = [...targetFeed, `notification:${userId}`]
    }
  } else {
    targetFeed = []
  }
 
  return await clientUser.reactions.add("comment", activityId, {
    text: message,
    count_upvote: 0,
    count_downvote: 0,
    isNotSeen: true
  }, {targetFeeds: targetFeed, userId});
};
