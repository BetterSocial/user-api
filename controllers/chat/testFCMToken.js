const {messaging} = require('firebase-admin');
const {ResponseSuccess} = require('../../utils/Responses');

const checkFCMToken = async (userToken) => {
  const payload = {
    notification: {
      title: 'Test Notification',
      body: 'Test'
    },
    token: userToken
  };

  try {
    await messaging().send(payload);
    console.log('Token is valid.');
    return true; // Token is valid
  } catch (error) {
    if (error.code === 'messaging/registration-token-not-registered') {
      console.error(`Token ${userToken} is invalid: ${error.message}`);
      return false; // Token is invalid
    } else {
      console.error(`Error sending message: ${error.message}`);
      return false; // Error occurred, but we treat token as invalid
    }
  }
};

const testFCMToken = async (req, res) => {
  // This endpoint used to test if the FCM token is valid or not
  const token = req.body.token;
  const validToken = await checkFCMToken(token);
  if (!validToken) {
    return ResponseSuccess(res, 'Invalid FCM token', 400, {});
  }
  return ResponseSuccess(res, 'Success', 200, {});
};

module.exports = testFCMToken;
