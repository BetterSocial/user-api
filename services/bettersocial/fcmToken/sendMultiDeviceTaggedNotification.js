const {messaging} = require('firebase-admin');
const FcmTokenFunction = require('../../../databases/functions/fcmToken');
const {FcmToken} = require('../../../databases/models');
const UsersFunction = require('../../../databases/functions/users');
const {User} = require('../../../databases/models');

const sendMultiDeviceTaggedNotification = async (
  userAuthor,
  userTargetId,
  message,
  activity_id
) => {
  const signedUser = await UsersFunction.findUserById(User, userTargetId);
  const userTargetTokens = await FcmTokenFunction.findAllTokenByUserId(
    FcmToken,
    signedUser.user_id
  );

  await Promise.all(
    userTargetTokens.map(async (user) => {
      const payload = {
        notification: {
          title: `${userAuthor?.username} tagged you in a post: ${
            message ? message.substring(0, 50) : ''
          }`,
          body: message
          // click_action: 'OPEN_ACTIVITY_1'
        },
        data: {
          feed_id: activity_id,
          type: 'feed'
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

module.exports = sendMultiDeviceTaggedNotification;
