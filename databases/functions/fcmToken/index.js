const FcmTokenFunction = {
  findTokenByUserId: require('./find-token-by-user-id'),
  findAllTokenByUserId: require('./findAllTokenByUserId'),
  findFcmToken: require('./findFcmToken')
};

module.exports = FcmTokenFunction;
