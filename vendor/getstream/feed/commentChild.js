const _ = require('lodash');
const GetstreamSingleton = require('../singleton');

module.exports = async (
  token,
  message,
  reactionId,
  commentAuthorUserId,
  postMakerId,
  parentCommentUserId,
  sendPostNotif = true,
  otherCommentatorNotify = []
) => {
  const clientUser = GetstreamSingleton.getClientInstance(token);
  let targetFeed = [
    `notification:${postMakerId}`,
    `notification:${parentCommentUserId}`,
    `notification:${commentAuthorUserId}`,
    ...otherCommentatorNotify
  ];

  if (sendPostNotif) {
    targetFeed = _.uniq(targetFeed);
  } else {
    targetFeed = [];
  }

  const data = await clientUser.reactions.addChild(
    'comment',
    {id: reactionId},
    {
      text: message,
      count_upvote: 0,
      count_downvote: 0,
      isNotSeen: true
    },
    {targetFeeds: targetFeed, userId: commentAuthorUserId}
  );

  return data;
};
