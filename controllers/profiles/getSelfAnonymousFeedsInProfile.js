const moment = require('moment')
const {
  POST_VERB_POLL,
  MAX_FEED_FETCH_LIMIT,
} = require("../../helpers/constants");
const {
  DomainPage,
  User,
} = require("../../databases/models");

const UsersFunction = require("../../databases/functions/users");
const Getstream = require("../../vendor/getstream");
const ErrorResponse = require("../../utils/response/ErrorResponse");
const SuccessResponse = require("../../utils/response/SuccessResponse");
const { modifyPollPostObject, modifyPostLinkPost } = require('../../utils/post');

module.exports = async (req, res) => {
  try {
    let { limit = MAX_FEED_FETCH_LIMIT, offset = 0 } = req.query

    const anonymousUserId = await UsersFunction.findAnonymousUserId(User, req.userId)

    const result = await Getstream.feed.getAnonymousFeeds(anonymousUserId?.user_id, limit, offset)
    const newResult = []
    for (let item of result?.results || []) {
      let now = moment().valueOf()
      let dateExpired = moment(item?.expired_at).valueOf()

      if (dateExpired > now) continue
      let newItem = { ...item };

      if (newItem.anonimity) {
        newItem.actor = {}
        newItem.to = []
        newItem.origin = null
        newItem.object = ""
      }

      let isValidPollPost = item.verb === POST_VERB_POLL && item?.polls?.length > 0

      if (isValidPollPost) newItem = await modifyPollPostObject(req?.userId, newItem)
      else newItem = await modifyPostLinkPost(DomainPage, newItem)

      newResult.push(newItem);
    }

    const responseData = {
      feeds: newResult,
      offset: offset + (result?.results?.length || 0)
    }
    return SuccessResponse(res, responseData)
  } catch (e) {
    console.log(e)
    return ErrorResponse.e500(res, e)
  }
};