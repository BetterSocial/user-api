const stream = require('getstream');
const _ = require('lodash');
module.exports = async (
  reactionId,
  userId,
  useridFeed,
  message,
  token,
  sendPostNotif,
  postMakerId
) => {
  const clientUser = stream.connect(process.env.API_KEY, token, process.env.APP_ID);
  let targetFeed = [
    `notification:${useridFeed}`,
    `notification:${userId}`,
    `notification:${postMakerId}`
  ];
  if (sendPostNotif) {
    targetFeed = _.uniq(targetFeed);
  } else {
    targetFeed = [];
  }
  return await clientUser.reactions.addChild(
    'comment',
    {id: reactionId},
    {
      text: message,
      count_upvote: 0,
      count_downvote: 0,
      isNotSeen: true
    },
    {targetFeeds: targetFeed, userId}
  );
};
