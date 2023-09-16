const getstreamService = require(".");
const {
  MAX_FEED_FETCH_LIMIT,
  MAX_GET_FEED_FROM_GETSTREAM_ITERATION,
  MAX_DATA_RETURN_LENGTH,
} = require("../../helpers/constants");
const { getExcludePostParameters } = require("./excludePostParameters");
const { activityFormatter } = require("./activityFormatter");

const getActivtiesByFeedId = async (feed, id, paramGetFeeds) => {
  const response = await getstreamService.getActivitiesByFeed(
    feed,
    id,
    paramGetFeeds
  );
  const feeds = response.results;
  // console.log(" DEBUG => ", feeds);
  return feeds;
};
const getUnfilteredActivitiesByFeed = async (req) => {
  let getFeedFromGetstreamIteration = 0;
  const data = [];
  let {
    offset = 0,
    limit = MAX_DATA_RETURN_LENGTH,
    getstreamLimit = MAX_FEED_FETCH_LIMIT,
    feedgroup,
    feedid,
  } = req.query;

  while (data.length < limit) {
    if (getFeedFromGetstreamIteration === MAX_GET_FEED_FROM_GETSTREAM_ITERATION)
      break;
    const paramGetFeeds = {
      limit: getstreamLimit,
      reactions: { own: true, recent: true, counts: true },
      //   ranking: GETSTREAM_RANKING_METHOD,
      offset,
    };
    const excludedPostParameter = await getExcludePostParameters(req.userId);

    const feeds = await getActivtiesByFeedId(feedgroup, feedid, paramGetFeeds);
    if (feeds.length !== 0) {
      for (const item of feeds) {
        const newItem = await activityFormatter(
          item,
          feedgroup,
          req.userId,
          excludedPostParameter
        );
        data.push(newItem);
        offset++;

        if (parseInt(data.length, 10) === parseInt(limit, 10)) break;
      }
    }
    // Change to conventional loop because map cannot handle await

    getFeedFromGetstreamIteration++;
  }

  return {
    data,
    offset,
    feedgroup,
  };
};

module.exports = {
  getUnfilteredActivitiesByFeed,
};
