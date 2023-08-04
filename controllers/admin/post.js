const BetterSocialCore = require("../../services/bettersocial");
const ErrorResponse = require("../../utils/response/ErrorResponse");
const SuccessResponse = require("../../utils/response/SuccessResponse");
const { LogError } = require("../../databases/models");
const { createToken } = require("../../services/getstream");
const { generateAnonymousUsername } = require("./bulkPost");

const postController = async (req, res) => {
  try {
    let { post } = req?.body || {};

    const { anonimity, userId, images_url } = post;
    if (anonimity) {
      let anonUserInfo = await generateAnonymousUsername();
      post.anon_user_info = {
        color_name: anonUserInfo.colorName,
        color_code: anonUserInfo.colorCode,
        emoji_name: anonUserInfo.emojiName,
        emoji_code: anonUserInfo.emojiIcon,
      };
    }
    if (images_url.length >= 1) {
      post.is_photo_uploaded = true;
    } else {
      post.is_photo_uploaded = false;
    }
    req.body = post;
    let token = await createToken(userId);
    req.userId = userId;
    req.token = token;
    let { isSuccess, message } = await BetterSocialCore.post.createPost(
      req,
      anonimity
    );
    console.log("message", message);
    if (!isSuccess) {
      console.log(message);
      let messageForInsert = {
        process: `post insert user ${post.userId}`,
        message: message,
      };

      LogError.create({
        message: JSON.stringify(messageForInsert),
      });
      return ErrorResponse.e500(res, message);
    }
    return SuccessResponse(res, "Post created successfully");
  } catch (e) {
    console.log("error", e);
    return ErrorResponse.e500(res, e.message);
  }
};

module.exports = postController;
