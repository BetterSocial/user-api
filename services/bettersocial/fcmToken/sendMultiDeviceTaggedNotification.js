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
        }
      };
      await messaging().sendToDevice(user?.token, payload);
    })
  );
};

module.exports = sendMultiDeviceTaggedNotification;
