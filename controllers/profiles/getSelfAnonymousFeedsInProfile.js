const moment = require('moment');
const {POST_VERB_POLL, MAX_FEED_FETCH_LIMIT} = require('../../helpers/constants');
const {DomainPage, User} = require('../../databases/models');

const UsersFunction = require('../../databases/functions/users');
const Getstream = require('../../vendor/getstream');
const ErrorResponse = require('../../utils/response/ErrorResponse');
const SuccessResponse = require('../../utils/response/SuccessResponse');
const {modifyPollPostObject, modifyPostLinkPost, filterFeeds} = require('../../utils/post');

module.exports = async (req, res) => {
  try {
    let {limit = MAX_FEED_FETCH_LIMIT, offset = 0} = req.query;

    const anonymousUserId = await UsersFunction.findAnonymousUserId(User, req.userId);
    if (!anonymousUserId) return ErrorResponse.e404(res, 'Anonymous user not found');

    const result = await Getstream.feed.getAnonymousFeeds(anonymousUserId?.user_id, limit, offset);
    const newResult = await filterFeeds(req?.userId, result?.results || []);

    const responseData = {
      feeds: newResult,
      offset: offset + (result?.results?.length || 0)
    };
    return SuccessResponse(res, responseData);
  } catch (e) {
    console.log(e);
    return ErrorResponse.e500(res, e?.message);
  }
};
