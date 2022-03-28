const axios = require("axios");
const { PollingOption, LogPolling, sequelize } = require("../../databases/models");
const { NO_POLL_OPTION_UUID, POST_TYPE_POLL } = require("../../helpers/constants");
const { getDetailFeed } = require("../../services/getstream");
const { responseSuccess } = require("../../utils/Responses");
module.exports = async (req, res) => {
  let id = req.query.id;
  let feed = await getDetailFeed(req.token, id);
  let feedItem = feed.results[0];

  let newItem = { ...feedItem };
 
  if(newItem.anonimity) {
    newItem.actor = {}
    newItem.to = []
    newItem.origin = null
    newItem.object = ""
  }
  if(feedItem.post_type === POST_TYPE_POLL) {
    let pollOptions = await PollingOption.findAll({
      where: {
        polling_option_id: feedItem.polls,
      },
    });
  
    let pollingOptionsId = pollOptions.reduce((acc, current) => {
      acc.push(current.polling_id);
      return acc;
    }, []);
  
    let logPolling = await LogPolling.findAll({
      where: {
        polling_id: pollingOptionsId,
        user_id: req.userId,
      },
    });
  
    if (logPolling.length > 0) {
      if (feedItem.multiplechoice) newItem.mypolling = logPolling;
      else newItem.mypolling = logPolling[0];
      newItem.isalreadypolling = true;
    } else {
      newItem.isalreadypolling = false;
      newItem.mypolling = [];
    }
  
    let distinctPollingByUserId = await sequelize.query(`SELECT DISTINCT(user_id) from public.log_polling WHERE polling_id='${feedItem.polling_id}' AND polling_option_id !='${NO_POLL_OPTION_UUID}'`);
    let voteCount = distinctPollingByUserId[0].length
  
    newItem.pollOptions = pollOptions;
    newItem.voteCount = voteCount;
  }

  return res
    .status(200)
    .json(responseSuccess("success get detail feed", newItem));
};
