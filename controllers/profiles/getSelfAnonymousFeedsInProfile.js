const moment = require('moment')
const {
  POST_VERB_POLL,
  MAX_FEED_FETCH_LIMIT,
  NO_POLL_OPTION_UUID,
  POST_TYPE_LINK,
} = require("../../helpers/constants");
const {
  PollingOption,
  LogPolling,
  DomainPage,
  User,
  sequelize,
} = require("../../databases/models");

const RedisDomainHelper = require("../../services/redis/helper/RedisDomainHelper");
const UsersFunction = require("../../databases/functions/users");
const Getstream = require("../../vendor/getstream");
const ErrorResponse = require("../../utils/response/ErrorResponse");
const SuccessResponse = require("../../utils/response/SuccessResponse");

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
      if (isValidPollPost) newItem = await modifyPollPost(newItem, req?.userId)
      else newItem = await modifyPostLinkPost(newItem)

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

async function modifyPostLinkPost(post) {
  if (post?.post_type !== POST_TYPE_LINK) return post

  let domainPageId = post?.og?.domain_page_id
  let credderScoreCache = await RedisDomainHelper.getDomainCredderScore(domainPageId)
  if (credderScoreCache) {
    post.credderScore = credderScoreCache
    post.credderLastChecked = await RedisDomainHelper.getDomainCredderLastChecked(domainPageId)
  } else {
    let dataDomain = await DomainPage.findOne({
      where: { domain_page_id: domainPageId },
      raw: true
    })

    await RedisDomainHelper.setDomainCredderScore(domainPageId, dataDomain.credder_score)
    await RedisDomainHelper.setDomainCredderLastChecked(domainPageId, dataDomain.credder_last_checked)

    post.credderScore = dataDomain.credder_score
    post.credderLastChecked = dataDomain.credder_last_checked
  }

  return post
}

async function modifyPollPost(post, userId) {
  let pollOptions = await PollingOption.findAll({
    where: {
      polling_option_id: post.polls,
    },
  });

  let pollingOptionsId = pollOptions.reduce((acc, current) => {
    acc.push(current.polling_id);
    return acc;
  }, []);

  let logPolling = await LogPolling.findAll({
    where: {
      polling_id: pollingOptionsId,
      user_id: userId,
    },
  });

  if (logPolling.length === 0) {
    post.isalreadypolling = false
    post.mypolling = []
  }

  if (logPolling.length > 0) {
    post.isalreadypolling = true
    post.mypolling = post?.multiplechoice ? logPolling : logPolling[0]
  }

  let distinctPollingByUserId = await sequelize.query(
    `SELECT DISTINCT(user_id) from public.log_polling WHERE polling_id= :polling_id AND polling_option_id != :polling_option_id`,
    {
      type: sequelize.QueryTypes.SELECT,
      replacements: {
        polling_id: post.polling_id,
        polling_option_id: NO_POLL_OPTION_UUID,
      }
    }
  );
  let voteCount = distinctPollingByUserId[0]?.length || 0;

  post.pollOptions = pollOptions;
  post.voteCount = voteCount;

  return post
}