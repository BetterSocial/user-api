const getstreamService = require("../../services/getstream");

const Validator = require("fastest-validator");
const v = new Validator();

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
    let {activity_id, limit} = req.body;
    const token = req.token;
    getstreamService
      .getReaction(activity_id, token, limit)
      .then((result) => {
        res.status(200).json({
          status: "success",
          data: result.results,
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
    console.log(error);
    return res.status(500).json({
      code: 500,
      data: null,
      message: "Internal server error",
      error: error,
    });
  }
};
