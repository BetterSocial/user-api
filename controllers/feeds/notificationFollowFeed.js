const getstreamService = require('../../services/getstream');

const notifcationFollowFeed = async (req, res) => {
  try {
    const process = await getstreamService.notificationFollowFeed(req.userid);
  } catch (e) {
    res.status(e.response.status).send({
      success: false,
      message: String(e)
    });
  }
};

module.exports = {
  notifcationFollowFeed
};
