const {messaging} = require('firebase-admin');
const FcmTokenFunction = require('../../../databases/functions/fcmToken');
const {FcmToken} = require('../../../databases/models');

const sendGroupChatNotification = async (userTargetId, message) => {
  const userTargetToken = await FcmTokenFunction.findTokenByUserId(FcmToken, userTargetId);

  const payload = {
    notification: {
      title: message,
      body: message
    },
    data: {},
    token: userTargetToken?.token
  };
  if (userTargetToken) {
    try {
      messaging()
        .send(payload)
        .then(() => {});
    } catch (error) {
      console.log('error send group chat notifications', error);
    }
  }
};

module.exports = sendGroupChatNotification;
