const getstreamService = require("../../services/getstream");

module.exports = async (req, res) => {
  try {
    const token = req.token;
    const { user_id, feedGroup } = req.body;
    const schema = {
      user_id: "string|empty:false",
      feedGroup: "string|empty:false",
    };
    const validate = v.validate(req.body, schema);
    if (validate.length) {
      return res.status(403).json({
        code: 403,
        status: "error",
        message: validate,
      });
    }

    getstreamService
      .followUser(token, user_id, feedGroup)
      .then((result) => {
        res.status(200).json({
          code: 200,
          status: "success",
          data: result,
        });
      })
      .catch((err) => {
        res.status(403).json({
          code: 403,
          status: "failed",
          data: null,
        });
      });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      code: 500,
      status: "failed",
      message: err,
    });
  }
};
