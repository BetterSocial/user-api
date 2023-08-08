const { EVENT_SYNC_FEED } = require("../../services/score/constant");
const { syncFeed } = require("../../services/queue/queueInit");

module.exports = async (req, res) => {
  try {
    const { userId } = req.params;
    // TODO: check if user id exist
    
    // add job for sync feed
    let data = {
        userId
    }
    syncFeed.add(data);
    return res.status(200).json({
      code: 200,
      status: 'success'
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: 500,
      data: null,
      message: 'Internal server error',
      error: error,
    });
  }
};
