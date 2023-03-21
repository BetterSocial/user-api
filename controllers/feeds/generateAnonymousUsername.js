const PostAnonUserInfoFunction = require("../../databases/functions/postAnonUserInfo");
const { CONTENT_TYPE_COMMENT } = require("../../helpers/constants");
const BetterSocialConstantListUtils = require("../../services/bettersocial/constantList/utils");
const SuccessResponse = require("../../utils/response/SuccessResponse")

const { PostAnonUserInfo, User } = require('../../databases/models');
const ErrorResponse = require("../../utils/response/ErrorResponse");

module.exports = async (req, res) => {
    const { body } = req

    let emoji = BetterSocialConstantListUtils.getRandomEmoji();
    let color = BetterSocialConstantListUtils.getRandomColor();

    let maxIteration = 3
    let currentIteration = 0

    try {
        if (body?.contentType === CONTENT_TYPE_COMMENT) {
            const postAnonUserInfo = await PostAnonUserInfoFunction.checkSelfUsernameInPost(PostAnonUserInfo, User, {
                postId: body?.postId,
                userId: req?.userId
            })

            if (postAnonUserInfo) {
                return SuccessResponse(res, {
                    data: {
                        emojiName: postAnonUserInfo?.anon_user_info_emoji_name,
                        emojiIcon: postAnonUserInfo?.anon_user_info_emoji_code,
                        colorName: postAnonUserInfo?.anon_user_info_color_name,
                        colorCode: postAnonUserInfo?.anon_user_info_color_code,
                    }
                });
            }
        }

        let anonUserInfo = {
            emojiName: emoji.name,
            emojiIcon: emoji.emoji,
            colorName: color.color,
            colorCode: color.code,
        }

        while (body?.contentType === CONTENT_TYPE_COMMENT && currentIteration <= maxIteration) {
            const anotherAnonUserInfo = await PostAnonUserInfoFunction.checkAnotherUsernameInPost(PostAnonUserInfo, User, {
                postId: body?.postId,
                userId: req?.userId,
                anonUserInfoEmojiName: emoji.name,
                anonUserInfoEmojiCode: emoji.emoji,
                anonUserInfoColorName: color.color,
                anonUserInfoColorCode: color.code,
            })

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
            }

            currentIteration++
        }

        return SuccessResponse(res, { data: anonUserInfo });
    } catch (e) {
        console.log(e)
        return ErrorResponse.e500(res, e?.message);
    }
}