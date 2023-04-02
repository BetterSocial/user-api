const { token } = require("morgan");
const getstreamService = require("../../services/getstream");

module.exports = async (req, res) => {
  try {
    const { activity_id, message } = req.body;

    getstreamService
      .createReaction(token, activity_id, message)
      .then((result) => {
        res.status(200).json({ code: 200, status: "success", data: result });
      })
      .catch((err) => {
        res.status(400).json({ code: 400, status: "failed", data: err });
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
