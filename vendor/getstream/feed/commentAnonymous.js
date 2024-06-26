const createToken = require('../core/createToken');
const GetstreamSingleton = require('../singleton');

module.exports = async (
  anonymousUserId,
  message,
  activityId,
  feedOwnerUserId,
  anonUserInfo,
  sendPostNotif
) => {
  const anonymousToken = await createToken(anonymousUserId);
  const clientUser = GetstreamSingleton.getClientInstance(anonymousToken);
  let targetFeed = [`notification:${feedOwnerUserId}`];
  if (sendPostNotif) {
    if (feedOwnerUserId !== anonymousUserId) {
      targetFeed = [...targetFeed, `notification:${anonymousUserId}`];
    }
  } else {
    targetFeed = [];
  }
  const userAnon = await clientUser.user(anonymousUserId).get();

  if (!userAnon.data.username) {
    await clientUser
      .user(anonymousUserId)
      .update({username: `${anonUserInfo?.color_name} ${anonUserInfo?.emoji_name}`});
  }

  const handleResponse = await clientUser.reactions.add(
    'comment',
    activityId,
    {
      text: message,
      count_upvote: 0,
      count_downvote: 0,
      anon_user_info_color_name: anonUserInfo?.color_name,
      anon_user_info_color_code: anonUserInfo?.color_code,
      anon_user_info_emoji_name: anonUserInfo?.emoji_name,
      anon_user_info_emoji_code: anonUserInfo?.emoji_code,
      is_anonymous: anonUserInfo?.is_anonymous,
      isNotSeen: true
    },
    {targetFeeds: targetFeed, userId: anonymousUserId}
  );
  return handleResponse;
};
