const getstreamService = require("../../services/getstream");
const {
  POST_VERB_POLL,
  MAX_FEED_FETCH_LIMIT,
} = require("../../helpers/constants");
const { PollingOption } = require("../../databases/models");
const { Op } = require("sequelize");
const { getListBlockUser } = require("../../services/blockUser");
const lodash = require("lodash");

module.exports = async (req, res) => {
  try {
    const token = req.token;
    const listBlockUser = await getListBlockUser(req.userId);

    getstreamService
      .getFeeds(token, "main_feed", {
        limit: req.query.limit || MAX_FEED_FETCH_LIMIT,
        id_lt: req.query.id_lt || "",
        reactions: { own: true, recent: true, counts: true },
      })

      .then(async (result) => {
        let data = [];
        let feeds = result.results;
        let yFilter = listBlockUser.map((itemY) => {
          return itemY.user_id_blocked;
        });
        // let filteredX = feeds.filter(
        //   (itemX) => !yFilter.includes(itemX.actor.id)
        // );
        let newArr = feeds.reduce((feed, current) => {
          if (!yFilter.includes(current.actor.id)) {
            feed.push(current);
          }
          return feed;
        }, []);

        // Change to conventional loop because map cannot handle await

        for (let i = 0; i < newArr.length; i++) {
          let item = newArr[i];
          let now = new Date();
          let dateExpired = new Date(item.expired_at);
          if (now < dateExpired) {
            if (item.verb === POST_VERB_POLL) {
              let newItem = { ...item };
              let pollOptions = await PollingOption.findAll({
                where: {
                  polling_option_id: item.polls,
                },
              });
              newItem.pollOptions = pollOptions;
              data.push(newItem);
            } else {
              data.push(item);
            }
          }
        }

        res.status(200).json({
          code: 200,
          status: "success",
          data: data,
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(403).json({
          status: "failed",
          data: null,
          error: err,
        });
      });
  } catch (error) {
    return res.status(500).json({
      code: status,
      data: null,
      message: "Internal server error",
      error: error,
    });
  }
};
