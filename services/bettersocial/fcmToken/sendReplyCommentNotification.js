const { messaging } = require("firebase-admin");
const FcmTokenFunction = require("../../../databases/functions/fcmToken");
const { FcmToken } = require('../../../databases/models');
const UsersFunction = require("../../../databases/functions/users");
const {User} = require('../../../databases/models')
const sendReplyCommentNotification = async (userTargetId, commentAuthor, message, activity_id, postTitle = "") => {
    userTargetId = await UsersFunction.findSignedUserId(User, userTargetId)
    const userTargetToken = await FcmTokenFunction.findTokenByUserId(FcmToken, userTargetId)

    const payload = {
        notification: {
            title: `${commentAuthor?.username} replied to your comment on ${postTitle ? postTitle.substring(0, 50) : ''}`,
            body: message,
            click_action: "OPEN_ACTIVITY_1",
            image: commentAuthor?.profile_pic_path,
        },
        data: {
            feed_id: activity_id,
            type: 'feed'
        }
    };
    if (userTargetToken) {
        messaging().sendToDevice(userTargetToken?.token, payload).then((res) => {

        })
    }
}

module.exports = sendReplyCommentNotification