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
        },
        token: user?.token
      };

      try {
        await messaging().send(payload);
      } catch (error) {
        if (error.code === 'messaging/registration-token-not-registered') {
          console.error(`Token ${user?.token} not found: ${error.message}`);
        } else {
          console.error(`Failed to send push notification: ${error.message}`);
        }
      }
    })
  );
};

module.exports = sendMultiDeviceNotification;
