const ErrorResponse = require('../../utils/response/ErrorResponse');
const SuccessResponse = require('../../utils/response/SuccessResponse');
const getPlainFeedById = require('../../vendor/getstream/feed/getPlainFeedById');
const {User} = require('../../databases/models');
const CryptoUtils = require('../../utils/crypto');
const setExpirePost = require('../../vendor/getstream/feed/setExpirePost');

const getUserId = async (feed) => {
  let userId = '';
  if (feed.anonimity) {
    let anonymousId = feed.actor.id;
    let user = await User.findOne({where: {user_id: anonymousId}});
    return CryptoUtils.decryptAnonymousUserId(user.encrypted);
  }
  userId = feed.actor.id;
  return userId;
};

const blockUser = async (userId) => {
  let user = await User.findOne({
    where: {
      user_id: userId
    }
  });

  await user.update({is_banned: true, status: 'N'});
};

const postBlockUser = async (req, res) => {
  try {
    let {activity_id} = req.body;
    if (!activity_id) {
      return ErrorResponse.e400(res, 'activity id required');
    }

    let feed = await getPlainFeedById(activity_id);
    let userId = await getUserId(feed);
    await setExpirePost(activity_id);
    await blockUser(userId);
    return SuccessResponse(res, null, `success block user`);
  } catch (error) {
    console.log(error);
    return ErrorResponse.e400(res, error);
  }
};

module.exports = postBlockUser;
