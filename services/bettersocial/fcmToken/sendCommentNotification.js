const {messaging} = require('firebase-admin');
const FcmTokenFunction = require('../../../databases/functions/fcmToken');
const {FcmToken} = require('../../../databases/models');
const UsersFunction = require('../../../databases/functions/users');
const {User} = require('../../../databases/models');

const sendCommentNotification = async (userTargetId, commentAuthor, message, activity_id) => {
  const signedUser = await UsersFunction.findSignedUserId(User, userTargetId);
  const userTargetToken = await FcmTokenFunction.findTokenByUserId(FcmToken, signedUser);
  const payload = {
    notification: {
      title: `${commentAuthor?.username} commented on your post`,
      body: message
      // click_action: "OPEN_ACTIVITY_1",
      // image: commentAuthor?.profile_pic_path,
    },
    data: {
      feed_id: activity_id,
      type: 'feed'
    },
    token: userTargetToken?.token
  };
  if (userTargetToken) {
    messaging()
      .send(payload)
      .then(() => {});
  }
};

module.exports = sendCommentNotification;
