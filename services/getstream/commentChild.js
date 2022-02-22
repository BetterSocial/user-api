const stream = require("getstream");

module.exports = async (reactionId,userId, useridFeed, message, token) => {
  const clientUser = stream.connect(
    process.env.API_KEY,
    token,
    process.env.APP_ID
  );
  let targetFeed = [`notification:${useridFeed}`]
  if(useridFeed !== userId) {
    targetFeed = [...targetFeed, `notification:${userId}`]
  }
  return await clientUser.reactions.addChild(
    "comment",
    { id: reactionId },
    {
      text: message,
      count_upvote: 0,
      count_downvote: 0,
    },{targetFeeds: targetFeed, userId}
    
  );
};
