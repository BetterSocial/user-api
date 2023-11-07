const {messaging} = require('firebase-admin');
const FcmTokenFunction = require('../../../databases/functions/fcmToken');
const {FcmToken} = require('../../../databases/models');

const sendMultiDeviceNotification = async (
  userIdFollower,
  userNameFollower,
  userIdFollowed,
  userNameFollowed
) => {
  const userTargetTokens = await FcmTokenFunction.findAllTokenByUserId(FcmToken, userIdFollowed);

  await Promise.all(
    userTargetTokens.map(async (user) => {
      const payload = {
        notification: {
          title: userNameFollower,
          body: `${userNameFollower} followed you. Say 'Hi'!`
          // click_action: 'OPEN_ACTIVITY_1',
        },
        data: {
          username: userNameFollowed,
          type: 'follow_user',
          user_id: userIdFollowed,
          user_id_follower: userIdFollower,
          username_follower: userNameFollower
        }
      };

      await messaging().sendToDevice(user?.token, payload);
    })
  );
};

module.exports = sendMultiDeviceNotification;
