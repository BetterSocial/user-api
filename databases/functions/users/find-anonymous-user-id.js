const CryptoUtils = require('../../../utils/crypto');

module.exports = async (userModel, signedUserId) => {
  const anonymousUsername = CryptoUtils.getAnonymousUsername(signedUserId);
  const anonymousUser = await userModel.findOne({
    where: {
      username: anonymousUsername
    },
    raw: true
  });

  return anonymousUser;
};
