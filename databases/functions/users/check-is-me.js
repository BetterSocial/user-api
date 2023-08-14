const findSignedUserId = require('./find-signed-user-id');

module.exports = async (userModel, targetUserId, selfUserId) => {
  if (targetUserId === selfUserId) return true;

  const user = await userModel.findOne({
    where: {
      user_id: targetUserId
    },
    raw: true
  });

  const selfSignedUserId = await findSignedUserId(userModel, selfUserId);
  if (user?.is_anonymous) {
    const signedUserId = await findSignedUserId(userModel, targetUserId);
    return signedUserId === selfSignedUserId;
  }

  return user?.user_id === selfSignedUserId;
};
