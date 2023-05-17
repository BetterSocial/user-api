const ErrorResponse = require("../../utils/response/ErrorResponse");
const SuccessResponse = require("../../utils/response/SuccessResponse");
const getPlainFeedById = require("../../vendor/getstream/feed/getPlainFeedById");
const { User } = require("../../databases/models");
const CryptoUtils = require("../../utils/crypto");

const getUserId = async (feed) => {
  let userId = "";
  if (feed.anonimity) {
    let anonymousId = feed.actor.id;
    let user = await User.findOne({ where: { user_id: anonymousId } });
    return (userId = CryptoUtils.decryptAnonymousUserId(user.encrypted));
  }
  userId = feed.actor.id;
  return userId;
};

const postBlockUser = async (req, res) => {
  try {
    let { activity_id } = req.body;
    console.log("activity: id", activity_id);
    if (!activity_id) {
      return ErrorResponse.e400(res, "activity id required");
    }

    let feed = await getPlainFeedById(activity_id);
    let userId = await getUserId(feed);

    return SuccessResponse(res, feed, `success ${userId}`);
  } catch (error) {
    console.log(error);
    return ErrorResponse.e400(res, error);
  }
};

module.exports = postBlockUser;
