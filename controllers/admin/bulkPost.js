const BetterSocialCore = require("../../services/bettersocial");
const ErrorResponse = require("../../utils/response/ErrorResponse");
const SuccessResponse = require("../../utils/response/SuccessResponse");
const { LogError } = require("../../databases/models");
const { createToken } = require("../../services/getstream");
const BetterSocialConstantListUtils = require("../../services/bettersocial/constantList/utils");
const PostAnonUserInfoFunction = require("../../databases/functions/postAnonUserInfo");
const { CONTENT_TYPE_COMMENT } = require("../../helpers/constants");

const bulkPostController = async (req, res) => {
  try {
    let { post } = req?.body || {};

    if (post.length < 1) {
      return ErrorResponse.e400(res, "Data not null");
    }

    for (let element of post) {
      const { anonimity, userId, images_url } = element;
      if (anonimity) {
        let anonUserInfo = await generateAnonymousUsername();
        element.anon_user_info = {
          color_name: anonUserInfo.colorName,
          color_code: anonUserInfo.colorCode,
          emoji_name: anonUserInfo.emojiName,
          emoji_code: anonUserInfo.emojiIcon,
        };
      }
      if (images_url.length >= 1) {
        element.is_photo_uploaded = true;
      } else {
        element.is_photo_uploaded = false;
      }
      req.body = element;
      let token = await createToken(userId);
      req.userId = userId;
      req.token = token;
      let { isSuccess, message } = await BetterSocialCore.post.createPost(
        req,
        anonimity
      );
      if (!isSuccess) {
        console.log(message);
        let messageForInsert = {
          process: `bulk insert user ${element.userId}`,
          message: message,
        };

        LogError.create({
          message: JSON.stringify(messageForInsert),
        });
      }
    }
    return SuccessResponse(res, "Post created successfully");
  } catch (e) {
    console.log("error", e);
    return ErrorResponse.e500(res, e.message);
  }
};

const generateAnonymousUsername = async () => {
  let body = {
    contentType: "post",
  };

  let emoji = BetterSocialConstantListUtils.getRandomEmoji();
  let color = BetterSocialConstantListUtils.getRandomColor();

  let maxIteration = 3;
  let currentIteration = 0;

  try {
    if (body?.contentType === CONTENT_TYPE_COMMENT) {
      const postAnonUserInfo =
        await PostAnonUserInfoFunction.checkSelfUsernameInPost(
          PostAnonUserInfo,
          User,
          {
            postId: body?.postId,
            userId: req?.userId,
          }
        );

      if (postAnonUserInfo) {
        return SuccessResponse(res, {
          data: {
            emojiName: postAnonUserInfo?.anon_user_info_emoji_name,
            emojiIcon: postAnonUserInfo?.anon_user_info_emoji_code,
            colorName: postAnonUserInfo?.anon_user_info_color_name,
            colorCode: postAnonUserInfo?.anon_user_info_color_code,
          },
        });
      }
    }

    let anonUserInfo = {
      emojiName: emoji.name,
      emojiIcon: emoji.emoji,
      colorName: color.color,
      colorCode: color.code,
    };

    while (
      body?.contentType === CONTENT_TYPE_COMMENT &&
      currentIteration <= maxIteration
    ) {
      const anotherAnonUserInfo =
        await PostAnonUserInfoFunction.checkAnotherUsernameInPost(
          PostAnonUserInfo,
          User,
          {
            postId: body?.postId,
            userId: req?.userId,
            anonUserInfoEmojiName: emoji.name,
            anonUserInfoEmojiCode: emoji.emoji,
            anonUserInfoColorName: color.color,
            anonUserInfoColorCode: color.code,
          }
        );

      if (anotherAnonUserInfo === null) {
        break;
      }

      emoji = BetterSocialConstantListUtils.getRandomEmoji();
      color = BetterSocialConstantListUtils.getRandomColor();
      anonUserInfo = {
        emojiName: emoji.name,
        emojiIcon: emoji.emoji,
        colorName: color.color,
        colorCode: color.code,
      };

      currentIteration++;
    }

    return anonUserInfo;
  } catch (e) {
    console.log(e);
    return ErrorResponse.e500(res, e?.message);
  }
};

module.exports = {
  bulkPostController,
  generateAnonymousUsername,
};
