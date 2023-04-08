const UsersFunction = require('../../databases/functions/users')
const getstreamService = require('../../services/getstream')
const { User } = require('../../databases/models')

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @returns 
 */
module.exports = async (req, res) => {
    const { postId } = req.params
    const token = req.token
    const userId = req.userId
    const anonymousUserId = await UsersFunction.findAnonymousUserId(User, userId)

    const getstreamQueryResult = await getstreamService.getFeeds(token, 'user_anon', {
        ids: [postId]
    })

    const [feed] = getstreamQueryResult?.results || {}
    if (feed?.actor?.id !== anonymousUserId?.user_id) {
        return res.status(200).json({
            success: false,
            message: 'You are not authorized to delete this post'
        })
    }

    try {
        const getstreamDeleteResult = await getstreamService.deleteFeedById(token, 'user_anon', postId)
        return res.status(200).json({
            success: getstreamDeleteResult ? true : false,
        })
    } catch (e) {
        return res.status(200).json({
            success: false,
            message: e
        })
    }
}