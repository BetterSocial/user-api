const { UserFollowUser } = require("../../databases/models");
const { getDetailFeed } = require("../../services/getstream");

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
        code: 1,
        message: 'Feed not found'
    })

    if (feed?.actor?.id === req?.userId) return res?.status(200)?.json({
        success: true,
        message: 'You are the author of this feed'
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
        code: 2,
        message: 'Author is not following you'
    })

    return res?.status(200)?.json({
        success: true,
        message: 'Author is following you'
    })
}
