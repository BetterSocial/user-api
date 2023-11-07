const {messaging} = require('firebase-admin');
const FcmTokenFunction = require('../../../databases/functions/fcmToken');
const {FcmToken} = require('../../../databases/models');

const sendNotification = async (
  userIdFollower,
  userNameFollower,
  userIdFollowed,
  userNameFollowed
) => {
  const userTargetToken = await FcmTokenFunction.findTokenByUserId(FcmToken, userIdFollowed);

  const payload = {
    notification: {
      title: userNameFollower,
      body: `${userNameFollower} followed you. Say 'Hi'!`
      // click_action: "OPEN_ACTIVITY_1",
    },
    data: {
      username: userNameFollowed,
      type: 'follow_user',
      user_id: userIdFollowed,
      user_id_follower: userIdFollower,
      username_follower: userNameFollower
    }
  };
  if (userTargetToken) {
    messaging()
      .sendToDevice(userTargetToken?.token, payload)
      .then(() => {});
  }
};

module.exports = sendNotification;
