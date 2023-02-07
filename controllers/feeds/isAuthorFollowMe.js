const { UserFollowUser, UserBlockedUser } = require("../../databases/models");
const { POST_CHECK_FEED_EXPIRED, POST_CHECK_AUTHOR_BLOCKED, POST_CHECK_AUTHOR_NOT_FOLLOWING, POST_CHECK_FEED_NOT_FOUND } = require("../../helpers/constants");
const { getDetailFeed } = require("../../services/getstream");
const { isDateExpired } = require("../../utils/date");

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
module.exports = async (req, res) => {
    let { postId } = req?.params
    let response = await getDetailFeed(req.token, postId);
    const feed = response?.results[0]

    if (!feed) return res?.status(404)?.json({
        success: false,
        code: POST_CHECK_FEED_NOT_FOUND,
        message: 'Feed not found'
    })

    if (isDateExpired(feed?.expired_at)) return res?.status(200)?.json({
        success: false,
        code: POST_CHECK_FEED_EXPIRED,
        message: 'This post has been expired'
    })

    if (feed?.actor?.id === req?.userId) return res?.status(200)?.json({
        success: true,
        message: 'You are the author of this feed'
    })

    let isAuthorBlockedMe = await UserBlockedUser?.findOne({
        where: {
            user_id_blocker: feed?.actor?.id,
            user_id_blocked: req?.userId
        },
        raw: true,
    })

    if(isAuthorBlockedMe) return res?.status(200)?.json({
        success: false,
        code: POST_CHECK_AUTHOR_BLOCKED,
        message: 'Author has blocked you'
    })

    let isAuthorFollowMe = await UserFollowUser?.findOne({
        where: {
            user_id_follower: feed?.actor?.id,
            user_id_followed: req?.userId
        },
        raw: true
    })

    if (!isAuthorFollowMe) return res?.status(200)?.json({
        success: false,
        code: POST_CHECK_AUTHOR_NOT_FOLLOWING,
        message: 'Author is not following you'
    })

    return res?.status(200)?.json({
        success: true,
        message: 'Author is following you'
    })
}
