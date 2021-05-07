const getstreamService = require("../../services/getstream");
const { POST_VERB_POLL, MAX_FEED_FETCH_LIMIT } =require("../../helpers/constants")
const {PollingOption} = require("../../databases/models")
const {Op} = require("sequelize")

module.exports = async (req, res) => {
  try {
    const token = req.token;

    getstreamService
      .getFeeds(token, "main_feed", {
        limit : req.query.limit || MAX_FEED_FETCH_LIMIT
      })

      .then(async (result) => {
        let data = [];

        // Change to conventional loop because map cannot handle await
        for(let i = 0; i < result.results.length; i++) {
          let item = result.results[i]
          let now = new Date();
          let dateActivity = new Date(item.expired_at);
          if (now < dateActivity) {
            if(item.verb === POST_VERB_POLL) {
              let newItem = { ...item }
              let pollOptions = await PollingOption.findAll({
                where : {
                  polling_option_id : item.polls
                }
              })

              // console.log(pollOptions)
              newItem.pollOptions = pollOptions
              console.log(newItem)

              data.push(newItem)
            }
          }
        }
        
        res.status(200).json({
          code: 200,
          status: "success",
          data: {
            results: data,
            next: result.next,
            duration: result.duration,
          },
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
