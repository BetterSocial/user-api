const getstreamService = require("../../services/getstream");
const { User, Locations } = require("../../databases/models");

const Validator = require("fastest-validator");
const v = new Validator();

const moment = require("moment");
const cloudinary = require("cloudinary");
const formatLocationGetStream = require("../../helpers/formatLocationGetStream");
const { POST_TYPE_STANDARD, POST_VERB_POLL } = require("../../helpers/constants");
const { addForCreatePost } = require("../../services/score");
const { handleCreatePostTO, filterAllTopics, insertTopics } = require("../../utils/post");
const emojiUnicode = require("emoji-unicode");
const { convertTopicWithEmoji } = require("../../utils");

function addDays(theDate, days) {
  return new Date(theDate.getTime() + days * 24 * 60 * 60 * 1000);
}

const getUserDetail = async (userId) => {
  try {
    return await User.findByPk(userId);
  } catch (err) {
    console.log(err);
  }
};

const getLocationDetail = async (locationId) => {
  try {
    return await Locations.findByPk(locationId);
    // return await Locations.findByPk(1);
  } catch (err) {
    console.log(err);
  }
};

const checkExpirationDate = async (req, res) => {
  const {duration_feed} = req?.body
  let date = new Date();
  if (duration_feed !== "never") {
    date = addDays(date, duration_feed);
    expiredAt = date.toISOString();

    if (pollsDurationMoment.valueOf() > date.getTime()) return res.status(403).json({
      message: "Polling Duration cannot be more than post expiration date",
      success: false,
    });
  } else {
    date = addDays(date, 100 * 365)
    expiredAt = date.toISOString()
  }

  return expiredAt
}

const processBasePost = async (req, res) => {
  const { location_id, message, topics, verb, feedGroup } = req?.body
  let expiredAt;

  let userDetail = await getUserDetail(req.userId);
  let location_level = "";
  if (location_id) {
    const locationDetail = await getLocationDetail(location_id);
    location_level = locationDetail.location_level;
  }

  let newTopic = filterAllTopics(message, topics)
  let TO = handleCreatePostTO(req.userId, req.body)
  let object = {
    verb: verb,
    message: message,
    topics: newTopic,
    feed_group: feedGroup,
    username: userDetail.username,
    profile_pic_path: userDetail.profile_pic_path,
    real_name: userDetail.real_name,
  };
}

const preProcessPollPost = async () => {

}

const preProcessTweetPost = async () => {

}

const postProcessPost = async () => {

}

const validateBody = async (req, res) => {
  if (!req?.body?.verb) {
    res.status(500).json({
      code: 500,
      message: "Post type is not defined",
      data: null,
    });

    return false
  }

  let baseSchema = {
    message: "string|empty:false",
    verb: "string|empty:false",
    feedGroup: "string|empty:false",
    privacy: "string|empty:false",
    anonimity: "boolean|empty:false",
    location: "string|empty:false",
    duration_feed: "string|empty:false",
    // images_url: "array",
  }

  if (req?.body?.verb === POST_VERB_POLL) {
    baseSchema = {
      ...baseSchema,
      polls: "array|empty:false",
      pollsduration: {
        $$type: "object",
        day: "number|empty:false",
        hour: "number|empty:false",
        minute: "number|empty:false",
      },
      multiplechoice: "boolean|empty:false",
    }
  } else {
    baseSchema = {
      ...baseSchema,
      images_url: "array",
    }
  }

  const validate = v.validate(req.body, baseSchema);
  if (validate.length) {
    res.status(400).json({
      code: 400,
      status: "error",
      message: validate,
    });
    return false
  }
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

    if (await validateBody(req, res) === false) return

  } catch (e) {
    console.log(error);
    return res.status(500).json({
      code: 500,
      data: null,
      message: "Internal server error",
      error: error,
    });
  }
};
