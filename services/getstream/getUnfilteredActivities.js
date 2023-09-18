const getstreamService = require('.');
const {
  MAX_FEED_FETCH_LIMIT,
  MAX_GET_FEED_FROM_GETSTREAM_ITERATION,
  MAX_DATA_RETURN_LENGTH
} = require('../../helpers/constants');
const {getExcludePostParameters} = require('./excludePostParameters');
const {activityFormatter} = require('./activityFormatter');

const getActivtiesOnFeed = async (feed, token, paramGetFeeds) => {
  const response = await getstreamService.getFeeds(token, feed, paramGetFeeds);
  const feeds = response.results;
  return feeds;
};

const feedSwitch = async (feed) => {
  switch (feed) {
    case 'main_feed_following':
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
  const excludedPostParameter = await getExcludePostParameters(req.userId);

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
      const newItem = await activityFormatter(item, feed, req.userId, excludedPostParameter);
      data.push(newItem);
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
