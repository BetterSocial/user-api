const getstreamService = require("../../services/getstream");
const { User } = require("../../databases/models");

const Validator = require("fastest-validator");
const v = new Validator();

const moment = require("moment");
const cloudinary = require("cloudinary");
const formatLocationGetStream = require("../../helpers/formatLocationGetStream");
const { POST_TYPE_STANDARD } = require("../../helpers/constants");
const { addForCreatePost } = require("../../services/score");

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
      // topics: "array|empty:false",
      message: "string|empty:false",
      verb: "string|empty:false",
      feedGroup: "string|empty:false",
      privacy: "string|empty:false",
      anonimity: "boolean|empty:false",
      location: "string|empty:false",
      // location_id: "string|empty:false",
      duration_feed: "string|empty:false",
      images_url: "array",
    };

    const validate = v.validate(req.body, schema);
    if (validate.length) {
      return res.status(400).json({
        code: 400,
        status: "error",
        message: validate,
      });
    }

    let {
      message,
      verb,
      feedGroup,
      privacy,
      topics,
      anonimity,
      location,
      location_id,
      duration_feed,
      images_url,
    } = req.body;


    console.log('location id: ', location_id);
    let userDetail = await getUserDetail(req.userId);

    let expiredAt = null;
    let TO = [];

    let resUrl;
    if (images_url) {
      resUrl = await Promise.all(
        images_url.map(async (res) => {
          try {
            const uploadStr = "data:image/jpeg;base64," + res;
            let returnCloudinary = await cloudinary.v2.uploader.upload(
              uploadStr,
              {
                overwrite: false,
                invalidate: true,
              }
            );
            return returnCloudinary.secure_url;
          } catch (error) {
            return res.status(500).json({
              code: 500,
              status: "error",
              message: error,
            });
          }
        })
      );
    }
    if (duration_feed !== "never") {
      let date = new Date();
      date = addDays(date, duration_feed);
      // 2021-04-20T09:02:15.000Z
      let utc = new Date(date.toUTCString());
      expiredAt = utc.toISOString();
    }

    TO.push("location:everywhare");
    TO.push("user:" + req.userId);
    if (topics !== null) {
      topics.map((value) => {
        TO.push("topic:" + value);
      });
    }

    if (location !== null) {
      let loc = formatLocationGetStream(location);
      TO.push("location:" + loc);
    }

    let object = {
      verb: verb,
      message: message,
      topics: topics,
      feed_group: feedGroup,
      username: userDetail.username,
      profile_pic_path: userDetail.profile_pic_path,
      real_name: userDetail.real_name,
    };

    let data = {
      verb: verb,
      message: message,
      topics: topics,
      privacy: privacy,
      object: object,
      anonimity: anonimity,
      location: location,
      duration_feed: duration_feed,
      images_url: resUrl,
      expired_at: expiredAt,
      count_upvote: 0,
      count_downvote: 0,
      post_type: POST_TYPE_STANDARD,
      to: TO,
    };

    getstreamService
      .createPost(token, feedGroup, data)
      .then((result) => {
    
        // send queue for scoring processing on create post
        const scoringProcessData = {
          feed_id: result.id,
          foreign_id : data.foreign_id,
          time: result.time,
          user_id: userDetail.user_id,
          message: data.message,
          topics: data.topics,
          privacy: data.privacy,
          anonimity: data.anonimity,
          location_level: location_level,
          duration_feed: data.duration_feed,
          expired_at: moment.utc(data.expired_at).format("YYYY-MM-DD HH:mm:ss"),
          images_url: data.images_url,
          created_at: moment.utc(data.time).format("YYYY-MM-DD HH:mm:ss"),
        };
        addForCreatePost(scoringProcessData);
        
        res.status(200).json({
          code: 200,
          status: "success create post",
          data: null,
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(403).json({
          code: 403,
          status: "failed create post",
          data: null,
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
