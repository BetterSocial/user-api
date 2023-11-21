/* eslint-disable no-continue */
/* eslint-disable no-prototype-builtins */
/* eslint-disable guard-for-in */
const _ = require('lodash');
const moment = require('moment');
const {
  PollingOption,
  LogPolling,
  Topics,
  DomainPage,
  sequelize,
  Sequelize
} = require('../databases/models');
const {NO_POLL_OPTION_UUID, POST_TYPE_LINK, POST_VERB_POLL} = require('../helpers/constants');
const deleteActivityFromUserFeed = require('../services/getstream/deleteActivityFromUserFeed');

/**
 *
 * @param {String} userId
 * @param {Object} postBody
 */

const RedisDomainHelper = require('../services/redis/helper/RedisDomainHelper');

/**
 *
 * @param {String} text
 * @param {String[]} topics
 * @returns {String[]}
 */
const filterAllTopics = (text, topics = []) => {
  const topicsFromText = text.match(/#([A-Z0-9-_]+)\b/gi) || [];
  const topicsFromTextWithoutHashtag = topicsFromText.reduce((acc, next) => {
    acc.push(next.slice(1));
    return acc;
  }, []);

  return [...new Set([...topicsFromTextWithoutHashtag, ...topics])];
  // return topics;
};

const handleCreatePostTO = (
  userId,
  postBody,
  isAnonimous = true,
  locationString = null,
  targetUser = null
) => {
  const {privacy, topics, message, tagUsers} = postBody;
  const TO = [];
  if (tagUsers && Array.isArray(tagUsers)) {
    const mapTagUser = tagUsers.map((user) => `notification:${user}`);
    TO.push(...mapTagUser);
  }

  TO.push(`main_feed:${userId}`);
  if (targetUser) {
    TO.push(`notification:${targetUser}`);
  } else {
    TO.push(`notification:${userId}`);
  }
  TO.push('user:bettersocial');

  if (topics !== null) {
    filterAllTopics(message, topics).forEach((value) => {
      TO.push(`topic:${value}`);
    });
  }

  if (privacy.toLowerCase() === 'public') {
    if (!isAnonimous) TO.push(`user:${userId}`);
    TO.push('location:everywhere');
  }

  if (locationString !== null) {
    TO.push(`location:${locationString}`);
  }

  const removeDuplicate = _.union(TO);
  return removeDuplicate;
};

const modifyPollPostObject = async (userId, item) => {
  const post = {...item};
  if (!item?.polls) return post;
  const pollOptions = await PollingOption.findAll({
    where: {
      polling_option_id: item.polls
    },
    order: [['created_at', 'ASC']]
  });

  const pollingOptionsId = pollOptions.reduce((acc, current) => {
    acc.push(current.polling_id);
    return acc;
  }, []);

  const logPolling = await LogPolling.findAll({
    where: {
      polling_id: pollingOptionsId,
      user_id: userId
    }
  });

  if (logPolling.length > 0) {
    if (item.multiplechoice) post.mypolling = logPolling;
    else {
      const [mypolling] = logPolling;
      post.mypolling = mypolling;
    }
    post.isalreadypolling = true;
  } else {
    post.isalreadypolling = false;
    post.mypolling = [];
  }

  const distinctPollingByUserId = await sequelize.query(
    `SELECT DISTINCT(user_id) from public.log_polling A WHERE A.polling_id = :polling_id AND A.polling_option_id != :polling_option_id`,
    {
      type: Sequelize.QueryTypes.SELECT,
      replacements: {
        polling_id: post.polling_id,
        polling_option_id: NO_POLL_OPTION_UUID
      }
    }
  );
  const voteCount = distinctPollingByUserId?.length || 0;

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
  const listBlock = String(listBlockUser + listBlockDomain);

  const newArr = await _.filter(feeds, (o) => !listBlock.includes(o?.actor?.id));

  const listAnonymous = listPostAnonymous.map((value) => value.post_anonymous_id_blocked);

  const feedWithAnonymous = newArr.reduce((feed, current) => {
    if (!listAnonymous.includes(current?.id)) {
      feed.push(current);
    }
    return feed;
  }, []);

  return feedWithAnonymous;
};

const modifyAnonimityPost = (item) => {
  const newItem = {...item};

  if (newItem.anonimity) {
    newItem.actor = {};
    newItem.to = [];
    newItem.origin = null;
    newItem.object = '';
  }

  return newItem;
};

const isPostBlocked = (item, listAnonymous, listBlock, myLocations) => {
  // Check if this anonymous post is from the user that has other blocked anonymous post
  if (listAnonymous.includes(item?.actor?.id) && item?.anonimity) return true;

  // Check if this users have been blocked
  if (listBlock.includes(item?.actor?.id)) return true;

  // Check locations
  return !myLocations.includes(item.location) && item.location !== 'Everywhere';
};

/**
 *
 * @param {String[]} topics
 */
const insertTopics = async (topics = []) => {
  const lastTopic = await Topics.findOne({
    order: [['topic_id', 'DESC']],
    limit: 1,
    raw: true
  });

  for (const index in topics) {
    const isTopicFound = await Topics.findOne({
      where: {name: topics[index]},
      raw: true
    });

    if (isTopicFound) continue;

    const topic = topics[index];
    const topicIndex = parseInt(lastTopic.topic_id, 10) + parseInt(index, 10) + parseInt(1, 10);

    try {
      await Topics.findOrCreate({
        where: {name: topic},
        defaults: {
          topic_id: topicIndex,
          name: topic,
          icon_path: '',
          is_custom_topic: true,
          created_at: new Date(),
          categories: ''
        }
      });
    } catch (e) {
      console.log(e);
      break;
    }
  }
};

function getFeedDuration(durationFeed) {
  let expiredAt = null;

  if (durationFeed !== 'never') {
    const dateMoment = moment().add(parseInt(durationFeed, 10), 'days');
    expiredAt = dateMoment.toISOString();
  }

  return expiredAt;
}

async function modifyPostLinkPost(domainPageModel, post) {
  if (post?.post_type !== POST_TYPE_LINK) return post;

  const domainPageId = post?.og?.domain_page_id;
  const credderScoreCache = await RedisDomainHelper.getDomainCredderScore(domainPageId);
  if (credderScoreCache) {
    post.credderScore = credderScoreCache;
    post.credderLastChecked = await RedisDomainHelper.getDomainCredderLastChecked(domainPageId);
  } else {
    const dataDomain = await domainPageModel.findOne({
      where: {domain_page_id: domainPageId},
      raw: true
    });

    await RedisDomainHelper.setDomainCredderScore(domainPageId, dataDomain.credder_score);
    await RedisDomainHelper.setDomainCredderLastChecked(
      domainPageId,
      dataDomain.credder_last_checked
    );

    post.credderScore = dataDomain.credder_score;
    post.credderLastChecked = dataDomain.credder_last_checked;
  }

  return post;
}

/**
 *
 * @param {Object} post
 * @param {Boolean} [isAnonimous = true]
 * @returns {Object}
 */
function modifyReactionsPost(post, isAnonimous = true) {
  if (!isAnonimous) return post;

  const newPost = {...post};

  const itemReducer = (acc, next) => {
    if (next.data.anon_user_info_color_name) {
      next.user = {};
      next.user_id = '';
      next.target_feeds = [];
      next.data.target_feeds = [];
    }

    acc.push(next);
    return acc;
  };

  if (newPost.hasOwnProperty('latest_reactions')) {
    const upvotes = newPost?.latest_reactions?.upvotes || [];
    const downvotes = newPost?.latest_reactions?.downvotes || [];
    const comments = newPost?.latest_reactions?.comment || [];

    const newUpvotes = upvotes.reduce(itemReducer, []);
    const newDownvotes = downvotes.reduce(itemReducer, []);
    const newComments = comments.reduce(itemReducer, []);

    newPost.latest_reactions.upvotes = newUpvotes;
    newPost.latest_reactions.downvotes = newDownvotes;
    newPost.latest_reactions.comments = newComments;
  }

  if (newPost.hasOwnProperty('own_reactions')) {
    const upvotes = newPost?.own_reactions?.upvotes || [];
    const downvotes = newPost?.own_reactions?.downvotes || [];
    const comments = newPost?.own_reactions?.comment || [];

    const newUpvotes = upvotes.reduce(itemReducer, []);
    const newDownvotes = downvotes.reduce(itemReducer, []);
    const newComments = comments.reduce(itemReducer, []);

    newPost.own_reactions.upvotes = newUpvotes;
    newPost.own_reactions.downvotes = newDownvotes;
    newPost.own_reactions.comments = newComments;
  }
  return newPost;
}

const isExpiredPost = (item) => {
  const now = moment().valueOf();
  const dateExpired = moment(item?.expired_at).valueOf();

  return dateExpired < now;
};

const deleteExpiredPostFromFeed = (item, feed_id) => {
  if (feed_id) {
    deleteActivityFromUserFeed('topic', feed_id, item.id);
  }
};

const modifyNewItemAnonymity = (newItem) => {
  if (newItem.anonimity) {
    newItem.actor = {};
    newItem.to = [];
    newItem.origin = null;
    newItem.object = '';
  }
  return newItem;
};

async function filterFeeds(userId, feeds = [], feed_id = null, threshold = null) {
  const newResult = feeds
    .filter(async (item) => {
      const expired = await isExpiredPost(item, feed_id);
      if (expired) {
        deleteExpiredPostFromFeed(item, feed_id);
        return false;
      }
      return !(expired || (threshold && (item.final_score || 0) < threshold));
    })
    .map(async (item) => {
      let newItem = {...item};

      newItem = modifyNewItemAnonymity(newItem);
      newItem = modifyReactionsPost(newItem, newItem.anonimity);
      const isValidPollPost = item.verb === POST_VERB_POLL && item?.polls?.length > 0;
      if (isValidPollPost) newItem = await modifyPollPostObject(userId, newItem);
      else newItem = await modifyPostLinkPost(DomainPage, newItem);

      return newItem;
    });
  return Promise.all(newResult);
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
  modifyReactionsPost,
  getFeedDuration,
  modifyPostLinkPost
};
