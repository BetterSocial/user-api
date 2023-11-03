const CryptoUtils = require('../../../utils/crypto');

module.exports = async (userModel, signedUserId, options = {raw: true}) => {
  const anonymousUsername = CryptoUtils.getAnonymousUsername(signedUserId);
  const anonymousUser = await userModel.findOne({
    where: {
      username: anonymousUsername
    },
    raw: options.raw
  });

  return anonymousUser;
};
