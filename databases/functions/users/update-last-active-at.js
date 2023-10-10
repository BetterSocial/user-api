const findSignedUserId = require('./find-signed-user-id');

module.exports = async (userModel, targetUserId, isAnonymous = false) => {
  let userId = targetUserId;
  if (isAnonymous) {
    userId = await findSignedUserId(userModel, targetUserId);
  }

  let user = await userModel.findOne({
    where: {
      user_id: userId
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  await user.update({
    last_active_at: new Date()
  });
};
