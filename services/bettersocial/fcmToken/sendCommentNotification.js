const { messaging } = require("firebase-admin");
const FcmTokenFunction = require("../../../databases/functions/fcmToken");
const { FcmToken } = require('../../../databases/models')

const sendCommentNotification = async (userTargetId, commentAuthor, message, activity_id) => {
    const userTargetToken = await FcmTokenFunction.findTokenByUserId(FcmToken, userTargetId)
    console.log('userTargetToken')
    console.log(userTargetToken)

    const payload = {
        notification: {
            title: `${commentAuthor?.username} commented on your post`,
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
            console.log(res, 'hehe')
        })
    }
}

module.exports = sendCommentNotification