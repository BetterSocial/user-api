const {
  PollingOption,
  LogPolling,
  Topics,
  DomainPage,
  sequelize,
  Sequelize,
} = require("../databases/models");
const { NO_POLL_OPTION_UUID, POST_TYPE_LINK, POST_VERB_POLL } = require("../helpers/constants");
const _ = require("lodash");
const moment = require('moment')

/**
 *
 * @param {String} userId
 * @param {Object} postBody
 */

const formatLocationGetStream = require("../helpers/formatLocationGetStream");
const RedisDomainHelper = require("../services/redis/helper/RedisDomainHelper");

const handleCreatePostTO = (userId, postBody, isAnonimous = true) => {
  let { privacy, topics, location, message, tagUsers } = postBody;
  let TO = [];
  if (tagUsers && Array.isArray(tagUsers)) {
    const mapTagUser = tagUsers.map((user) => `notification:${user}`);
    TO.push(...mapTagUser);
  }

  TO.push(`main_feed:${userId}`);
  TO.push(`notification:${userId}`);
  TO.push("user:bettersocial");

  if (topics !== null) {
    filterAllTopics(message, topics).forEach((value) => {
      TO.push("topic:" + value);
    });
  }

  if (privacy.toLowerCase() === "public") {
    if (!isAnonimous) TO.push(`user:${userId}`);
    TO.push("location:everywhere");
  }

  if (location !== null) {
    let loc = formatLocationGetStream(location);
    TO.push("location:" + loc);
  }

  const removeDuplicate = _.union(TO);
  return removeDuplicate;
};

const modifyPollPostObject = async (userId, item) => {
  let post = { ...item };
  if (!item?.polls) return post;
  let pollOptions = await PollingOption.findAll({
    where: {
      polling_option_id: item.polls,
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

  if (logPolling.length > 0) {
    if (item.multiplechoice) post.mypolling = logPolling;
    else post.mypolling = logPolling[0];
    post.isalreadypolling = true;
  } else {
    post.isalreadypolling = false;
    post.mypolling = [];
  }

  let distinctPollingByUserId = await sequelize.query(
    `SELECT DISTINCT(user_id) from public.log_polling WHERE polling_id= :polling_id AND polling_option_id != :polling_option_id`,
    {
      type: Sequelize.QueryTypes.SELECT,
      replacements: {
        polling_id: post.polling_id,
        polling_option_id: NO_POLL_OPTION_UUID,
      }
    }
  );
  let voteCount = distinctPollingByUserId[0]?.length || 0;

  post.pollOptions = pollOptions;
  post.voteCount = voteCount;

  return post;
};

const modifyAnonymousAndBlockPost = async (
  feeds,
  listBlockUser,
  listBlockDomain,
  listPostAnonymous
) => {
  let listBlock = String(listBlockUser + listBlockDomain);

  let newArr = await _.filter(feeds, function (o) {
    return !listBlock.includes(o?.actor?.id);
  });

  let listAnonymous = listPostAnonymous.map((value) => {
    return value.post_anonymous_id_blocked;
  });

  let feedWithAnonymous = newArr.reduce((feed, current) => {
    if (!listAnonymous.includes(current?.id)) {
      feed.push(current);
    }
    return feed;
  }, []);

  return feedWithAnonymous;
};

const modifyAnonimityPost = (item) => {
  let newItem = { ...item };

  if (newItem.anonimity) {
    newItem.actor = {};
    newItem.to = [];
    newItem.origin = null;
    newItem.object = "";
  }

  return newItem;
};

const isPostBlocked = (
  item,
  listAnonymous,
  listBlock,
  myLocations,
  listAnonymousPostIds
) => {
  // Check if this anonymous post is from the user that has other blocked anonymous post
  if (listAnonymous.includes(item?.actor?.id) && item?.anonimity) return true;

  // Check if this users have been blocked
  if (listBlock.includes(item.actor.id)) return true;

  // Check locations
  return (!myLocations.includes(item.location) && item.location != "Everywhere")
};

/**
 *
 * @param {String} text
 * @param {String[]} topics
 * @returns {String[]}
 */
const filterAllTopics = (text, topics = []) => {
  const topicsFromText = text.match(/#([A-Z0-9-_]+)\b/gi) || [];
  let topicsFromTextWithoutHashtag = topicsFromText.reduce((acc, next) => {
    acc.push(next.slice(1));
    return acc;
  }, []);

  return [...new Set([...topicsFromTextWithoutHashtag, ...topics])]
  // return topics;
};

/**
 *
 * @param {String[]} topics
 */
const insertTopics = async (topics = []) => {
  let lastTopic = await Topics.findOne({
    order: [["topic_id", "DESC"]],
    limit: 1,
    raw: true,
  });

  for (let index in topics) {
    let topic = topics[index];
    let topicIndex =
      parseInt(lastTopic.topic_id) + parseInt(index) + parseInt(1);

    try {
      await Topics.findOrCreate({
        where: { name: topic },
        defaults: {
          topic_id: topicIndex,
          name: topic,
          icon_path: "",
          is_custom_topic: true,
          created_at: new Date(),
          categories: "",
        },
      });
    } catch (e) {
      console.log(e);
      break;
    }
  }
};

function getFeedDuration(durationFeed) {
  let expiredAt = null;

  if (durationFeed !== "never") {
    let dateMoment = moment().add(parseInt(durationFeed), 'days');
    expiredAt = dateMoment.toISOString();
  }

  return expiredAt
}


async function modifyPostLinkPost(domainPageModel, post) {
  if (post?.post_type !== POST_TYPE_LINK) return post

  let domainPageId = post?.og?.domain_page_id
  let credderScoreCache = await RedisDomainHelper.getDomainCredderScore(domainPageId)
  if (credderScoreCache) {
    post.credderScore = credderScoreCache
    post.credderLastChecked = await RedisDomainHelper.getDomainCredderLastChecked(domainPageId)
  } else {
    let dataDomain = await domainPageModel.findOne({
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

async function filterFeeds(userId, feeds = []) {
  let newResult = []

  for (let item of feeds || []) {
    let now = moment().valueOf()
    let dateExpired = moment(item?.expired_at).valueOf()

    if (dateExpired < now) continue
    let newItem = { ...item };

    if (newItem.anonimity) {
      newItem.actor = {}
      newItem.to = []
      newItem.origin = null
      newItem.object = ""
    }

    let isValidPollPost = item.verb === POST_VERB_POLL && item?.polls?.length > 0

    if (isValidPollPost) newItem = await modifyPollPostObject(userId, newItem)
    else newItem = await modifyPostLinkPost(DomainPage, newItem)

    newResult.push(newItem);
  }

  return newResult
}

module.exports = {
  filterAllTopics,
  filterFeeds,
  handleCreatePostTO,
  insertTopics,
  isPostBlocked,
  modifyAnonimityPost,
  modifyAnonymousAndBlockPost,
  modifyPollPostObject,
  getFeedDuration,
  modifyPostLinkPost,
};
