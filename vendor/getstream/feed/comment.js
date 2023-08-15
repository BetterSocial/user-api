const _ = require('lodash');

const GetstreamSingleton = require('../singleton');

module.exports = async (
  token,
  message,
  activityId,
  commentAuthorUserId,
  feedOwnerUserId,
  sendPostNotif = true,
  postNotifTo = []
) => {
  const clientUser = GetstreamSingleton.getClientInstance(token);
  let targetFeed = [...postNotifTo, `notification:${feedOwnerUserId}`];
  if (sendPostNotif) {
    if (feedOwnerUserId !== commentAuthorUserId) {
      targetFeed = [...targetFeed, `notification:${commentAuthorUserId}`];
    }
  } else {
    targetFeed = [];
  }
  const target = _.union(targetFeed);
  const data = await clientUser.reactions.add(
    'comment',
    activityId,
    {
      text: message,
      count_upvote: 0,
      count_downvote: 0,
      isNotSeen: true
    },
    {targetFeeds: target, userId: commentAuthorUserId}
  );

  return data;
};
