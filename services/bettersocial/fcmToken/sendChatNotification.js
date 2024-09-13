const {messaging} = require('firebase-admin');
const FcmTokenFunction = require('../../../databases/functions/fcmToken');
const {FcmToken, User} = require('../../../databases/models');
const UsersFunction = require('../../../databases/functions/users');

const sendChatNotification = async (userTargetId, payload) => {
  const signedUser = await UsersFunction.findSignedUserId(User, userTargetId);
  const userTargetToken = await FcmTokenFunction.findAllTokenByUserId(FcmToken, signedUser);
  if (userTargetToken) {
    try {
      userTargetToken.forEach((user) => {
        const newPayload = {
          ...payload,
          token: user?.token
        };
        messaging()
          .send(newPayload)
          .then(() => {})
          .catch((e) => {
            console.log('error send chat notification in promise', e.code);
          });
      });
    } catch (error) {
      console.log('error send chat notifications', error);
    }
  }
};

module.exports = sendChatNotification;
