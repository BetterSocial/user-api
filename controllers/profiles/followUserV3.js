const moment = require('moment')

const UserFollowUserFunction = require("../../databases/functions/userFollowUser")
const ErrorResponse = require("../../utils/response/ErrorResponse")
const SuccessResponse = require("../../utils/response/SuccessResponse")

const {
    UserFollowUser, UserFollowUserHistory, User, sequelize,
} = require("../../databases/models")
const Getstream = require("../../vendor/getstream")
const { addForFollowUser } = require('../../services/score')
const BetterSocialCore = require('../../services/bettersocial')
const UsersFunction = require('../../databases/functions/users')

module.exports = async (req, res) => {
    const { user_id_followed, follow_source, username_follower, username_followed } = req.body

    if (req?.userId === user_id_followed) return ErrorResponse.e403(res, "Only allow following other profiles")

    if (await UserFollowUserFunction.checkIsUserFollowing(UserFollowUser, req?.userId, user_id_followed)) return ErrorResponse.e409(res, "You have followed this user")

    try {
        await sequelize.transaction(async (t) => {
            const userFollowUser = await UserFollowUserFunction.registerAddFollowUser(UserFollowUser, UserFollowUserHistory, req?.userId, [user_id_followed], follow_source, t)
            return userFollowUser
        })
    } catch (e) {
        console.log('Error in follow user v2 sql transaction')
        return ErrorResponse.e409(res, e.message)
    }

    try {
        const followUserExclusive = Getstream.feed.followUserExclusive(req?.userId, user_id_followed);
        const followUser = Getstream.feed.followUser(req?.token, req?.userId, user_id_followed);
        const followMainFeedFollowing = Getstream.feed.followMainFeedFollowing(req?.token, req?.userId, user_id_followed);

        // follow certain targeted feeds
        // - exclusive
        // - user
        // - main_feed_following
        await Promise.all([followUserExclusive, followUser, followMainFeedFollowing])

        const anonymousUser = await UsersFunction.findAnonymousUserId(User, user_id_followed)
        const selfAnonymousUser = await UsersFunction.findAnonymousUserId(User, req?.userId)

        await Getstream.feed.followAnonUser(req?.token, req?.userId, user_id_followed, selfAnonymousUser?.user_id, anonymousUser?.user_id)
    } catch (e) {
        console.log('Error in follow user v3 getstream')
        console.log(e)
        return ErrorResponse.e409(res, e.message)
    }

    try {
        await addForFollowUser({
            user_id: req?.user_id ?? req.userId,
            followed_user_id: user_id_followed,
            activity_time: moment.utc().format("YYYY-MM-DD HH:mm:ss"),
        });
    } catch (e) {
        console.log('Error in follow user v3 scoring')
        return ErrorResponse.e409(res, e.message)
    }

    try {
        await BetterSocialCore.fcmToken.sendMultiDeviceNotification(req?.userId, username_follower, user_id_followed, username_followed)
    } catch (e) {
        console.log('Error in follow user v3 fcm')
        console.log(e)
        return ErrorResponse.e409(res, e.message)
    }

    return SuccessResponse(res, {
        message: "User has been followed successfully"
    })
}