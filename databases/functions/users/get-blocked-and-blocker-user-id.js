const {Op} = require('sequelize');

const getBlockedAndBlockerUserId = async (userBlockUserModel, userId) => {
  if (!userId) throw new Error('User id is required');
  const users = await userBlockUserModel.findAll({
    where: {
      [Op.or]: [{user_id_blocker: userId}, {user_id_blocked: userId}]
    },
    raw: true
  });
  let userIds = new Set([]);
  for (const user of users) {
    userIds.add(user.user_id_blocked);
    userIds.add(user.user_id_blocker);
  }
  return Array.from(userIds);
};

module.exports = getBlockedAndBlockerUserId;
