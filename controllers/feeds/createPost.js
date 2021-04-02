const getstreamService = require("../../services/getstream");

const Validator = require("fastest-validator");
const v = new Validator();

function addDays(theDate, days) {
  return new Date(theDate.getTime() + days * 24 * 60 * 60 * 1000);
}

module.exports = async (req, res) => {
  try {
    const token = req.token;

    if (token == null) {
      return res.status(401).json({
        code: 401,
        message: "Failed auth",
        data: null,
      });
    }

    const schema = {
      topics: "array|empty:false",
      message: "string|empty:false",
      verb: "string|empty:false",
      feedGroup: "string|empty:false",
      privacy: "string|empty:false",
      anonimity: "boolean|empty:false",
      location: "string|empty:false",
      duration_feed: "string|empty:false",
      images_url: "array",
    };

    const validate = v.validate(req.body, schema);
    if (validate.length) {
      return res.status(403).json({
        code: 403,
        status: "error",
        message: validate,
      });
    }

    let {
      message,
      verb,
      object,
      feedGroup,
      privacy,
      topics,
      anonimity,
      location,
      duration_feed,
      images_url,
    } = req.body;

    let expiredAt = null;

    if (duration_feed !== "never") {
      let date = new Date();
      date = addDays(date, duration_feed);
      expiredAt = date.toISOString();
    }

    let data = {
      verb: verb,
      message: message,
      topics: topics,
      privacy: privacy,
      anonimity: anonimity,
      location: location,
      duration_feed: duration_feed,
      images_url: images_url,
      expired_at: expiredAt,
      count_upvote: 0,
      count_downvote: 0,
    };
    getstreamService
      .createPost(token, feedGroup, data)
      .then((result) => {
        res.status(200).json({
          code: 200,
          status: "success create post",
          data: result,
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(400).json({
          code: 400,
          status: "failed create post",
          data: null,
        });
      });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      data: null,
      message: "Internal server error",
      error: error,
    });
  }
};
