const {messaging} = require('firebase-admin');
const FcmTokenFunction = require('../../../databases/functions/fcmToken');
const {FcmToken, User} = require('../../../databases/models');
const UsersFunction = require('../../../databases/functions/users');

const sendChatNotification = async (userTargetId, payload, options = {}) => {
  const signedUser = await UsersFunction.findSignedUserId(User, userTargetId);
  const userTargetToken = await FcmTokenFunction.findAllTokenByUserId(FcmToken, signedUser);
  if (userTargetToken) {
    try {
      userTargetToken.forEach((user) => {
        messaging()
          .sendToDevice(user?.token, payload, options)
          .then(() => {});
      });
    } catch (error) {
      console.log('error send chat notifications', error);
    }
  }
};

module.exports = sendChatNotification;
