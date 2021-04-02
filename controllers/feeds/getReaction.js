const getstreamService = require("../../services/getstream");

module.exports = async (req, res) => {
  try {
    const schema = {
      activity_id: "string|empty:false",
    };
    const validate = v.validate(req.body, schema);
    if (validate.length) {
      return res.status(403).json({
        code: 403,
        status: "error",
        message: validate,
      });
    }
    const token = req.token;
    getstreamService
      .getReaction(token, activity_id)
      .then((result) => {
        res.status(200).json({
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
