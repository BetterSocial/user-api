const {messaging} = require('firebase-admin');
const FcmTokenFunction = require('../../../databases/functions/fcmToken');
const {FcmToken} = require('../../../databases/models');
const UsersFunction = require('../../../databases/functions/users');
const {User} = require('../../../databases/models');

const sendMultiDeviceReplyCommentNotification = async (
  userTargetId,
  commentAuthor,
  message,
  activity_id,
  postTitle = ''
) => {
  const signedUser = await UsersFunction.findSignedUserId(User, userTargetId);
  const userTargetTokens = await FcmTokenFunction.findAllTokenByUserId(FcmToken, signedUser);

  await Promise.all(
    userTargetTokens.map(async (user) => {
      const payload = {
        notification: {
          title: `${commentAuthor?.username} replied to your comment on ${
            postTitle ? postTitle.substring(0, 50) : ''
          }`,
          body: message
          // click_action: 'OPEN_ACTIVITY_1'
          // image: commentAuthor?.profile_pic_path,
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
          console.error(`Token ${user?.token} removed from database: ${error.message}`);
        } else {
          console.error(`Failed to send message: ${error.message}`);
        }
      }
    })
  );
};

module.exports = sendMultiDeviceReplyCommentNotification;
