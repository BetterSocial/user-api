const stream = require("getstream");
const Validator = require("fastest-validator");
const cli = require("cli");
const v = new Validator();
const jwt = require("jsonwebtoken");
const { duration } = require("moment-timezone");
const { result } = require("lodash");
const getstreamService = require("../../services/getstream");
const cloudinary = require("cloudinary");

exports.createPostFeed = async (req, res) => {
  try {
    const token = req.token;
    const now = new Date();

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
      object: "object|empty:false",
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
            return returnCloudinary.url;
          } catch (error) {
            return res.status(500).json({
              code: 500,
              status: "error",
              message: error,
            });
          }
        })
      );

      // await Promise.map(images_url, async (res) => {
      //   try {
      //     const uploadStr = "data:image/jpeg;base64," + res;
      //     let returnCloudinary = await cloudinary.v2.uploader.upload(
      //       uploadStr,
      //       {
      //         overwrite: false,
      //         invalidate: true,
      //       }
      //     );
      //     console.log(returnCloudinary);
      //     url_image_results.push(returnCloudinary);
      //   } catch (error) {
      //     return res.status(500).json({
      //       code: 500,
      //       status: "error",
      //       message: error,
      //     });
      //   }
      // });
    }
    const client = stream.connect(
      process.env.API_KEY,
      token,
      process.env.APP_ID
    );
    const user = client.feed(feedGroup, client.userId, token);

    user.follow();
    user
      .addActivity({
        actor: "SU:" + client.userId,
        verb: verb,
        object: object,
        message: message,
        foreign_id: client.userId + now.toISOString(),
        topics: topics,
        privacy: privacy,
        anonimity: anonimity,
        location: location,
        duration_feed: duration_feed,
        images_url: resUrl,
      })
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
    console.log(error);
    return res.status(500).json({
      code: status,
      data: null,
      message: "internal server error",
      error: error,
    });
  }
};

exports.createToken = async (req, res) => {
  const schema = {
    user_id: "string|empty:false",
  };
  const validate = v.validate(req.body, schema);
  if (validate.length) {
    return res.status(403).json({
      code: 403,
      status: "error",
      message: validate,
    });
  }
  let { user_id } = req.body;
  const payload = { user_id: user_id };
  let token2 = jwt.sign(payload, process.env.SECRET);
  const clientServer = stream.connect(process.env.API_KEY, process.env.SECRET);
  const userToken = await getstreamService.createToken(user_id);
  return res.status(200).json({
    id: user_id,
    token: userToken,
  });
};

exports.reaction = async (req, res) => {
  try {
    const { activity_id, kind, message, target_feeds } = req.body;
    const client = stream.connect(
      process.env.API_KEY,
      req.token,
      process.env.APP_ID
    );

    client.reactions
      .add(kind, activity_id, message, target_feeds)
      .then((result) => {
        res.status(200).json({ status: "success", data: result });
      })
      .catch((err) => {
        res.status(400).json({ status: "failed", data: err });
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

exports.getPost = async (req, res) => {
  try {
    const token = req.token;

    const client = stream.connect(
      process.env.API_KEY,
      token,
      process.env.APP_ID
    );

    const user = client.feed("main_feed", client.userId, token);

    user
      .get()
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

exports.getReaction = async (req, res) => {
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
    const client = stream.connect(
      process.env.API_KEY,
      token,
      process.env.APP_ID
    );
    client.reactions
      .filter({
        activity_id: activity_id,
      })
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

exports.createUser = async (req, res) => {
  const clientServerSide = getstreamService.streamClientServerSide();
  console.log(clientServerSide);
  let data = {
    human_id: "1234567",
    username: "testing ",
    profile_pic_url:
      "https://res.cloudinary.com/hpjivutj2/image/upload/v1617245336/Frame_66_1_xgvszh.png",
    created_at: "2021-03-31T22:51:33.000Z",
  };
  const user_id = "usupsuparma_testing";
  getstreamService
    .createUser(data, user_id)
    .then((result) => {
      console.log(result);
      res.status(201).json({
        status: "success",
        data: result,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(404).json({
        status: "failed",
        data: null,
        error: err,
      });
    });
};

exports.followUser = async (req, res) => {
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
    const client = stream.connect(
      process.env.API_KEY,
      token,
      process.env.APP_ID
    );
    console.log(client);
    const user = client.feed(feedGroup, req.userId, token);
    user
      .follow(feedGroup, user_id)
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
