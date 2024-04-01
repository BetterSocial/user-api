const {messaging} = require('firebase-admin');
const FcmTokenFunction = require('../../../databases/functions/fcmToken');
const {FcmToken, User} = require('../../../databases/models');
const UsersFunction = require('../../../databases/functions/users');

const sendChatNotification = async (userTargetId, payload) => {
  const signedUser = await UsersFunction.findSignedUserId(User, userTargetId);
  const userTargetToken = await FcmTokenFunction.findTokenByUserId(FcmToken, signedUser);
  if (userTargetToken) {
    try {
      messaging()
        .sendToDevice(userTargetToken?.token, payload)
        .then(() => {});
    } catch (error) {
      console.log('error send chat notifications', error);
    }
  }
};

module.exports = sendChatNotification;
