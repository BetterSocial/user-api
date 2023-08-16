const BetterSocialCore = require('../../services/bettersocial');
const ErrorResponse = require('../../utils/response/ErrorResponse');
const SuccessResponse = require('../../utils/response/SuccessResponse');
const {LogError, Log} = require('../../databases/models');
const {createToken} = require('../../services/getstream');
const {generateAnonymousUsername} = require('./bulkPost');

const postController = async (req, res) => {
  try {
    const {post} = req?.body || {};

    const {anonimity, userId, images_url} = post;
    if (anonimity) {
      const anonUserInfo = await generateAnonymousUsername();
      post.anon_user_info = {
        color_name: anonUserInfo.colorName,
        color_code: anonUserInfo.colorCode,
        emoji_name: anonUserInfo.emojiName,
        emoji_code: anonUserInfo.emojiIcon
      };
    }
    if (images_url.length >= 1) {
      post.is_photo_uploaded = true;
    } else {
      post.is_photo_uploaded = false;
    }
    req.body = post;
    const token = await createToken(userId);
    req.userId = userId;
    req.token = token;
    const {isSuccess, message} = await BetterSocialCore.post.createPostV3(req, anonimity);
    console.log('message-admin', message);
    if (!isSuccess) {
      const messageForInsert = {
        process: `post insert user ${post.userId}`,
        message
      };

      Log.create({
        titile: `error in user api`,
        description: `with message: ${message}`
      });
      LogError.create({
        message: JSON.stringify(messageForInsert)
      });
      return ErrorResponse.e500(res, message);
    }
    return SuccessResponse(res, 'Post created successfully');
  } catch (e) {
    console.log('error-admin', e);

    LogError.create({
      message: e
    });
    Log.create({
      titile: `error in user api`,
      description: ` error in catch with message: ${e}`
    });
    return ErrorResponse.e500(res, e.message);
  }
};

module.exports = postController;
