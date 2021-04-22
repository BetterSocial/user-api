const getstreamService = require("../../services/getstream");
module.exports = async (req, res) => {
  try {
    const foreignId = req.body.foreign_id;
    const feedGroup = req.body.feed_group;

    getstreamService
      .deleteFeed(req.token, feedGroup, foreignId)
      .then((result) => {
        res.status(200).json({
          code: 200,
          status: "success",
          data: result,
        });
      })
      .catch((err) => {
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
