const getstreamService = require("../../services/getstream");
const {
  POST_VERB_POLL,
  MAX_FEED_FETCH_LIMIT,
  GETSTREAM_RANKING_METHOD,
  MAX_GET_FEED_FROM_GETSTREAM_ITERATION,
  MAX_DATA_RETURN_LENGTH
} = require("../../helpers/constants");
const { Op } = require("sequelize");
const {
  getListBlockUser,
  getListBlockPostAnonymous,
} = require("../../services/blockUser");
const getBlockDomain = require("../../services/domain/getBlockDomain");
const { setData, getValue, delCache } = require("../../services/redis");
const { convertString } = require("../../utils/custom");
const { modifyPollPostObject, modifyAnonymousAndBlockPost, modifyAnonimityPost, isPostBlocked } = require("../../utils/post");
const putUserPostScore = require("../../services/score/putUserPostScore");

module.exports = async (req, res) => {
  let { offset = 0, limit = MAX_FEED_FETCH_LIMIT } = req.query

  let getFeedFromGetstreamIteration = 0;
  let data = []

  try {
    const token = req.token;
    const listBlockUser = await getListBlockUser(req.userId);
    const listBlockDomain = await getBlockDomain(req.userId);
    const listPostAnonymous = await getListBlockPostAnonymous(req.userId);

    let listAnonymous = listPostAnonymous.map((value) => {
      return value.post_anonymous_id_blocked;
    });

    let listBlock = String(listBlockUser + listBlockDomain);

    while (data.length < MAX_DATA_RETURN_LENGTH) {
      if (getFeedFromGetstreamIteration === MAX_GET_FEED_FROM_GETSTREAM_ITERATION) break;

      try {
        let paramGetFeeds = {
          limit,
          reactions: { own: true, recent: true, counts: true },
          ranking: GETSTREAM_RANKING_METHOD,
          offset
        };

        console.log('get feeds with ' + paramGetFeeds.offset)
        let response = await getstreamService.getFeeds(token, "main_feed", paramGetFeeds)
        let feeds = response.results;

        // Change to conventional loop because map cannot handle await
        for (let i = 0; i < feeds.length; i++) {
          let item = feeds[i];
          let isBlocked = isPostBlocked(item, listAnonymous, listBlock)
          if (isBlocked) {
            offset++;
            continue
          }

          // TODO Should be used for testing in dev only. Remove this when done testing (ask Bastian)
          // Put user post score in score details
          await putUserPostScore(item, req.userId);

          let now = new Date();
          let dateExpired = new Date(item.expired_at);
          if (now < dateExpired || item.duration_feed == "never") {
            let newItem = modifyAnonimityPost(item);
            if (item.verb === POST_VERB_POLL) {
              let postPoll = await modifyPollPostObject(req.userId, item)
              data.push(postPoll)
            } else {
              data.push(newItem);
            }
          }

          offset++;
          if (data.length === MAX_DATA_RETURN_LENGTH) break
        }

        getFeedFromGetstreamIteration++;
      } catch (err) {
        console.log(err);
        res.status(403).json({
          status: "failed",
          data: null,
          offset,
          error: err,
        });
      }
    }

    res.status(200).json({
      code: 200,
      status: "success",
      data: data,
      offset,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: 500,
      data: null,
      offset,
      message: "Internal server error",
      error: error,
    });
  }
};
