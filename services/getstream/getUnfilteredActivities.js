const moment = require('moment');
const getstreamService = require('.');
const {
  POST_VERB_POLL,
  MAX_FEED_FETCH_LIMIT,
  MAX_GET_FEED_FROM_GETSTREAM_ITERATION,
  MAX_DATA_RETURN_LENGTH,
  POST_TYPE_LINK
} = require('../../helpers/constants');
const {getListBlockUser, getListBlockPostAnonymousAuthor} = require('../blockUser');
const getBlockDomain = require('../domain/getBlockDomain');
const {modifyPollPostObject, isPostBlocked, modifyReactionsPost} = require('../../utils/post');
const {DomainPage, Locations, User} = require('../../databases/models');
const RedisDomainHelper = require('../redis/helper/RedisDomainHelper');

const getActivtiesOnFeed = async (feed, token, paramGetFeeds) => {
  const response = await getstreamService.getFeeds(token, feed, paramGetFeeds);
  const feeds = response.results;
  return feeds;
};

const feedSwitch = async (feed) => {
  switch (feed) {
    case 'main_feed_following':
      //     return "main_feed_topic";
      // case "main_feed_topic":
      return 'main_feed_f2';
    case 'main_feed_f2':
      return 'main_feed_broad';
    case 'main_feed_broad':
      return 'main_feed';
    default:
      return 'main_feed_following';
  }
};

const getUnfilteredActivities = async (req) => {
  let getFeedFromGetstreamIteration = 0;
  const data = [];
  let {
    offset = 0,
    limit = MAX_DATA_RETURN_LENGTH,
    getstreamLimit = MAX_FEED_FETCH_LIMIT,
    feed = 'main_feed_following'
  } = req.query;
  const {token} = req;
  // START get excluded post parameter
  const listBlockUser = await getListBlockUser(req.userId);
  const listBlockDomain = await getBlockDomain(req.userId);
  const listPostAnonymousAuthor = await getListBlockPostAnonymousAuthor(req.userId);

  const listAnonymousAuthor = listPostAnonymousAuthor.map(
    (value) => value.post_anonymous_author_id
  );

  const listAnonymousPostId = [];

  const listBlock = String(listBlockUser + listBlockDomain);

  const myLocations = [];
  const userLocations = await User.findByPk(req.userId, {
    include: [
      {
        model: Locations,
        as: 'locations',
        through: {attributes: []},
        attributes: ['neighborhood']
      }
    ]
  });
  userLocations.locations.forEach((loc) => {
    myLocations.push(loc.neighborhood);
  });
  // END get excluded post parameter

  while (data.length < limit) {
    if (getFeedFromGetstreamIteration === MAX_GET_FEED_FROM_GETSTREAM_ITERATION) break;
    const paramGetFeeds = {
      limit: getstreamLimit,
      reactions: {own: true, recent: true, counts: true},
      //   ranking: GETSTREAM_RANKING_METHOD,
      offset
    };

    const feeds = await getActivtiesOnFeed(feed, token, paramGetFeeds);
    if (feeds.length === 0) {
      if (feed === 'main_feed') {
        break;
      } else {
        offset = 0;
        feed = await feedSwitch(feed);
        continue;
      }
    }
    // Change to conventional loop because map cannot handle await
    for (const item of feeds) {
      // validation admin hide post
      item.show_to_user = true;
      item.unshow_reason = '';
      item.source_feed = feed;

      if (item.is_hide) {
        console.log('Is Hide => ', item.id);
        item.show_to_user = false;
        item.unshow_reason = 'post is hide';
      }

      const isBlocked = isPostBlocked(
        item,
        listAnonymousAuthor,
        listBlock,
        myLocations,
        listAnonymousPostId
      );
      if (isBlocked) {
        console.log('Is Blocked => ', item.id);
        item.show_to_user = false;
        item.unshow_reason = 'post is blocked';
      }

      // TODO Should be used for testing in dev only. Remove this when done testing (ask Bastian)
      // Put user post score in score details
      // await putUserPostScore(item, req.userId);

      const now = moment().valueOf();
      const dateExpired = moment(item?.expired_at).valueOf();
      if (now > dateExpired) {
        console.log('Is Expired => ', item.id);
        item.show_to_user = false;
        item.unshow_reason = 'post is hide';
      }
      // TODO: PLEASE ENABLE THIS CHECKER AFTER SCORING HAS BEEN FIXED
      let newItem = item; // await modifyAnonimityPost(item);
      newItem = modifyReactionsPost(newItem, newItem.anonimity);
      if (item.verb === POST_VERB_POLL) {
        const postPoll = await modifyPollPostObject(req.userId, item);
        data.push(postPoll);
      } else {
        if (item.post_type === POST_TYPE_LINK) {
          const domainPageId = item?.og?.domain_page_id;
          if (domainPageId) {
            const credderScoreCache = await RedisDomainHelper.getDomainCredderScore(domainPageId);
            if (credderScoreCache) {
              newItem.credderScore = credderScoreCache;
              newItem.credderLastChecked = await RedisDomainHelper.getDomainCredderLastChecked(
                domainPageId
              );
            } else {
              const dataDomain = await DomainPage.findOne({
                where: {domain_page_id: domainPageId},
                raw: true
              });

              if (dataDomain) {
                await RedisDomainHelper.setDomainCredderScore(
                  domainPageId,
                  dataDomain?.credder_score
                );
                await RedisDomainHelper.setDomainCredderLastChecked(
                  domainPageId,
                  dataDomain?.credder_last_checked
                );

                newItem.credderScore = dataDomain?.credder_score;
                newItem.credderLastChecked = dataDomain?.credder_last_checked;
              }
            }
          }
        }
        data.push(newItem);
      }
      //   console.log("DATA => ", data)
      offset++;

      if (parseInt(data.length, 10) === parseInt(limit, 10)) break;
    }

    getFeedFromGetstreamIteration++;
  }

  return {
    data,
    offset,
    feed
  };
};

module.exports = {
  getUnfilteredActivities
};
