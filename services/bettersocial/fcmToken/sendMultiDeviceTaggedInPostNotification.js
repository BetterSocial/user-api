const { messaging } = require('firebase-admin');
const FcmTokenFunction = require('../../../databases/functions/fcmToken');
const { FcmToken } = require('../../../databases/models');
const UsersFunction = require('../../../databases/functions/users');
const { User } = require('../../../databases/models');
const sendMultiDeviceTaggedInPostNotification = async (
  userTargetId,
  postCreator,
  postText,
  activity_id
) => {
  const signedUser = await UsersFunction.findSignedUserId(User, userTargetId);
  const userTargetTokens = await FcmTokenFunction.findAllTokenByUserId(
    FcmToken,
    signedUser
  );
  await Promise.all(
    userTargetTokens.map(async (user) => {
      const payload = {
        notification: {
          title: `${postCreator?.username} tagged your in a post`,
          body: postText,
          click_action: 'OPEN_ACTIVITY_1',
          // image: postCreator?.profile_pic_path,
        },
        data: {
          feed_id: activity_id,
          type: 'feed',
        },
      };

      await messaging().sendToDevice(user?.token, payload);
    })
  );
};

module.exports = sendMultiDeviceTaggedInPostNotification;
